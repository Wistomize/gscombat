import { DatabaseSync, type SQLInputValue, type StatementSync } from "node:sqlite"

import type {
  ArtifactSetRecord,
  CharacterRecord,
  CharacterSkillParameterGroupSummary,
  GameDataCounts,
  GameDataSourceManifest,
  WeaponRecord
} from "./types.js"

interface CharacterRow {
  readonly birthday_day: number | null
  readonly birthday_month: number | null
  readonly element: string | null
  readonly id: string
  readonly rarity: number
  readonly region: string | null
  readonly weapon_type: string
}

interface CharacterRawRow {
  readonly raw_json: string
}

interface WeaponRow {
  readonly id: string
  readonly rarity: number
  readonly weapon_type: string
}

interface ArtifactSetRow {
  readonly id: string
  readonly rarities_json: string
  readonly set_bonuses_json: string
  readonly slots_json: string
}

interface CountRow {
  readonly count: number
}

interface ValueRow {
  readonly value: number
}

interface JsonValueRow {
  readonly value_json: string
}

interface CharacterSkillParameterGroupSummaryRow {
  readonly maximum_talent_level: number | null
  readonly minimum_talent_level: number | null
  readonly parameter_count: number
}

interface CachedStatement {
  readonly get: (...params: SQLInputValue[]) => ReturnType<StatementSync["get"]>
  readonly all: (...params: SQLInputValue[]) => ReturnType<StatementSync["all"]>
}

function getNestedNumericValue(value: unknown, path: readonly number[]): number | undefined {
  let current: unknown = value
  for (const index of path) {
    if (!Number.isInteger(index) || index < 0 || !Array.isArray(current)) return undefined
    current = current[index]
  }
  return typeof current === "number" && Number.isFinite(current) ? current : undefined
}

function toCharacter(row: CharacterRow): CharacterRecord {
  return {
    birthdayDay: row.birthday_day,
    birthdayMonth: row.birthday_month,
    element: row.element,
    id: row.id,
    rarity: row.rarity,
    region: row.region,
    weaponType: row.weapon_type
  }
}

function getBaseStatsFromRawCharacter(rawJson: string): Readonly<Record<string, number>> {
  const raw = JSON.parse(rawJson) as { readonly baseStats?: Readonly<Record<string, unknown>> }
  return Object.fromEntries(
    Object.entries(raw.baseStats ?? {}).filter(([, value]) => typeof value === "number" && Number.isFinite(value))
  ) as Readonly<Record<string, number>>
}

function toWeapon(row: WeaponRow): WeaponRecord {
  return { id: row.id, rarity: row.rarity, weaponType: row.weapon_type }
}

function toArtifactSet(row: ArtifactSetRow): ArtifactSetRecord {
  return {
    id: row.id,
    rarities: JSON.parse(row.rarities_json) as number[],
    setBonuses: JSON.parse(row.set_bonuses_json) as number[],
    slots: JSON.parse(row.slots_json) as string[]
  }
}

/** Provides read-only, local access to one immutable game-data snapshot. */
export class GameDataRepository {
  readonly #database: DatabaseSync
  readonly #statements = new Map<string, CachedStatement>()
  readonly #results = new Map<string, unknown>()

  public constructor(databasePath: string) {
    this.#database = new DatabaseSync(databasePath, { readOnly: true })
    this.#database.exec("PRAGMA query_only = ON; PRAGMA foreign_keys = ON;")
  }

  public [Symbol.dispose](): void {
    this.close()
  }

  public getManifest(): GameDataSourceManifest {
    const row = this.#prepare("SELECT value FROM metadata WHERE key = ?").get("source_manifest") as
      | { value: string }
      | undefined
    if (!row) throw new Error("The game-data snapshot does not contain a source manifest")
    return this.#parseJson(row.value) as GameDataSourceManifest
  }

  public getCharacter(characterId: string): CharacterRecord | undefined {
    const row = this.#prepare(`
        SELECT id, element, region, weapon_type, rarity, birthday_month, birthday_day
        FROM characters
        WHERE id = ?
      `)
      .get(characterId) as unknown as CharacterRow | undefined
    return row ? toCharacter(row) : undefined
  }

  /** Returns inherent base stats that are not represented by a level curve, such as innate elemental mastery. */
  public getCharacterBaseStats(characterId: string): Readonly<Record<string, number>> {
    const row = this.#prepare("SELECT raw_json FROM characters WHERE id = ?")
      .get(characterId) as unknown as CharacterRawRow | undefined
    return row ? { ...this.#cached(`base-stats:${characterId}`, () => getBaseStatsFromRawCharacter(row.raw_json)) } : {}
  }

  /** Lists all character records contained in the immutable snapshot. */
  public listCharacters(): readonly CharacterRecord[] {
    const rows = this.#prepare(`
        SELECT id, element, region, weapon_type, rarity, birthday_month, birthday_day
        FROM characters
        ORDER BY id
      `)
      .all() as unknown as CharacterRow[]
    return rows.map(toCharacter)
  }

  public getCharacterSkillParameter(
    characterId: string,
    skill: string,
    parameterIndex: number,
    talentLevel: number
  ): number | undefined {
    const row = this.#prepare(`
        SELECT value
        FROM character_skill_parameters
        WHERE character_id = ? AND skill = ? AND parameter_index = ? AND talent_level = ?
      `)
      .get(characterId, skill, parameterIndex, talentLevel) as { value: number } | undefined
    return row?.value
  }

  /** Returns the complete upstream parameter group, including one-dimensional passive and constellation values. */
  public getCharacterSkillParameterGroup(characterId: string, groupId: string): unknown | undefined {
    const row = this.#prepare(`
        SELECT values_json AS value_json
        FROM character_skill_parameter_groups
        WHERE character_id = ? AND group_id = ?
      `)
      .get(characterId, groupId) as unknown as JsonValueRow | undefined
    return row ? this.#parseJson(row.value_json) : undefined
  }

  /** Summarizes the normalized numeric parameters available for one raw skill group. */
  public getCharacterSkillParameterGroupSummary(
    characterId: string,
    groupId: string
  ): CharacterSkillParameterGroupSummary | undefined {
    const row = this.#prepare(`
        SELECT
          MAX(parameters.talent_level) AS maximum_talent_level,
          MIN(parameters.talent_level) AS minimum_talent_level,
          COUNT(DISTINCT parameters.parameter_index) AS parameter_count
        FROM character_skill_parameter_groups AS groups
        LEFT JOIN character_skill_parameters AS parameters
          ON parameters.character_id = groups.character_id
          AND parameters.skill = groups.group_id
        WHERE groups.character_id = ? AND groups.group_id = ?
        GROUP BY groups.character_id, groups.group_id
      `)
      .get(characterId, groupId) as unknown as CharacterSkillParameterGroupSummaryRow | undefined
    if (!row) return undefined

    return {
      maximumTalentLevel: row.maximum_talent_level,
      minimumTalentLevel: row.minimum_talent_level,
      parameterCount: row.parameter_count
    }
  }

  /** Returns one numeric value from a raw upstream skill, passive, or constellation parameter group. */
  public getCharacterSkillParameterValue(
    characterId: string,
    groupId: string,
    path: readonly number[]
  ): number | undefined {
    return getNestedNumericValue(this.getCharacterSkillParameterGroup(characterId, groupId), path)
  }

  /** Lists the raw upstream parameter-group IDs available for one character or character variant. */
  public listCharacterSkillParameterGroupIds(characterId: string): readonly string[] {
    const rows = this.#prepare(`
        SELECT group_id
        FROM character_skill_parameter_groups
        WHERE character_id = ?
        ORDER BY group_id
      `)
      .all(characterId) as unknown as { group_id: string }[]
    return rows.map((row) => row.group_id)
  }

  /** Lists every upstream owner that contributes raw skill-parameter groups to the snapshot. */
  public listCharacterSkillParameterOwnerIds(): readonly string[] {
    const rows = this.#prepare("SELECT DISTINCT character_id FROM character_skill_parameter_groups ORDER BY character_id")
      .all() as unknown as { character_id: string }[]
    return rows.map((row) => row.character_id)
  }

  public getCharacterStat(characterId: string, stat: string, level: number, ascension: number): number | undefined {
    const row = this.#prepare(`
        SELECT curves.base_value * levels.multiplier + COALESCE(bonuses.value, 0) AS value
        FROM character_stat_curves AS curves
        JOIN character_level_curves AS levels ON levels.curve_id = curves.curve_id
        LEFT JOIN character_ascension_bonuses AS bonuses
          ON bonuses.character_id = curves.character_id
          AND bonuses.stat = curves.stat
          AND bonuses.ascension = ?
        WHERE curves.character_id = ? AND curves.stat = ? AND levels.level = ?
      `)
      .get(ascension, characterId, stat, level) as unknown as ValueRow | undefined
    if (row) return row.value

    const baseStat = this.getCharacterBaseStats(characterId)[stat]
    return baseStat === undefined ? undefined : baseStat + (this.getCharacterAscensionBonus(characterId, stat, ascension) ?? 0)
  }

  public getCharacterAscensionBonus(characterId: string, stat: string, ascension: number): number | undefined {
    const row = this.#prepare(`
        SELECT value
        FROM character_ascension_bonuses
        WHERE character_id = ? AND stat = ? AND ascension = ?
      `)
      .get(characterId, stat, ascension) as unknown as ValueRow | undefined
    return row?.value
  }

  public getWeapon(weaponId: string): WeaponRecord | undefined {
    const row = this.#prepare("SELECT id, weapon_type, rarity FROM weapons WHERE id = ?")
      .get(weaponId) as unknown as WeaponRow | undefined
    return row ? toWeapon(row) : undefined
  }

  /** Lists all weapon records contained in the immutable snapshot, sorted by ID. */
  public listWeapons(): readonly WeaponRecord[] {
    const rows = this.#prepare("SELECT id, weapon_type, rarity FROM weapons ORDER BY id")
      .all() as unknown as WeaponRow[]
    return rows.map(toWeapon)
  }

  public getArtifactSet(setId: string): ArtifactSetRecord | undefined {
    const row = this.#prepare("SELECT id, set_bonuses_json, rarities_json, slots_json FROM artifact_sets WHERE id = ?")
      .get(setId) as unknown as ArtifactSetRow | undefined
    return row ? toArtifactSet(row) : undefined
  }

  /** Lists all artifact-set records contained in the immutable snapshot, sorted by ID. */
  public listArtifactSets(): readonly ArtifactSetRecord[] {
    const rows = this.#prepare("SELECT id, set_bonuses_json, rarities_json, slots_json FROM artifact_sets ORDER BY id")
      .all() as unknown as ArtifactSetRow[]
    return rows.map(toArtifactSet)
  }

  public getWeaponStat(weaponId: string, stat: string, level: number, ascension: number): number | undefined {
    const row = this.#prepare(`
        SELECT curves.base_value * levels.multiplier + COALESCE(bonuses.value, 0) AS value
        FROM weapon_stat_curves AS curves
        JOIN weapon_level_curves AS levels ON levels.curve_id = curves.curve_id
        LEFT JOIN weapon_ascension_bonuses AS bonuses
          ON bonuses.weapon_id = curves.weapon_id
          AND bonuses.stat = curves.stat
          AND bonuses.ascension = ?
        WHERE curves.weapon_id = ? AND curves.stat = ? AND levels.level = ?
      `)
      .get(ascension, weaponId, stat, level) as unknown as ValueRow | undefined
    return row?.value
  }

  public getWeaponRefinementParameter(weaponId: string, parameter: string, refinement: number): number | undefined {
    const row = this.#prepare(`
        SELECT value
        FROM weapon_refinement_parameters
        WHERE weapon_id = ? AND parameter = ? AND refinement = ?
      `)
      .get(weaponId, parameter, refinement) as unknown as ValueRow | undefined
    return row?.value
  }

  public getArtifactMainStat(rarity: number, stat: string, level: number): number | undefined {
    const row = this.#prepare("SELECT value FROM artifact_main_stats WHERE rarity = ? AND stat = ? AND level = ?")
      .get(rarity, stat, level) as unknown as ValueRow | undefined
    return row?.value
  }

  public getArtifactSubstatRolls(rarity: number, stat: string): readonly number[] {
    const rows = this.#prepare("SELECT value FROM artifact_substat_rolls WHERE rarity = ? AND stat = ? ORDER BY tier")
      .all(rarity, stat) as unknown as ValueRow[]
    return rows.map((row) => row.value)
  }

  public getCounts(): GameDataCounts {
    return {
      artifactSets: this.#count("artifact_sets"),
      characterSkillParameterGroups: this.#count("character_skill_parameter_groups"),
      characterSkillParameters: this.#count("character_skill_parameters"),
      characters: this.#count("characters"),
      weapons: this.#count("weapons")
    }
  }

  public close(): void {
    this.#results.clear()
    this.#statements.clear()
    if (this.#database.isOpen) this.#database.close()
  }

  #cached<T>(key: string, read: () => T): T {
    if (!this.#database.isOpen) throw new Error("Game-data repository is closed")
    if (this.#results.has(key)) return this.#results.get(key) as T
    const value = read()
    if (this.#results.size >= 4096) this.#results.delete(this.#results.keys().next().value!)
    this.#results.set(key, value)
    return value
  }

  #parseJson(json: string): unknown {
    // Callers receive a copy; mutating a returned group must never affect another request.
    return structuredClone(this.#cached(`json:${json}`, () => JSON.parse(json) as unknown))
  }

  #prepare(sql: string) {
    if (!this.#database.isOpen) throw new Error("Game-data repository is closed")
    const cached = this.#statements.get(sql)
    if (cached) return cached
    const statement = this.#database.prepare(sql)
    const id = this.#statements.size
    // Query rows stay private. Public methods construct new records/arrays from them.
    const query = {
      get: (...params: SQLInputValue[]) => this.#cached(JSON.stringify([id, "get", params]), () => statement.get(...params)),
      all: (...params: SQLInputValue[]) => this.#cached(JSON.stringify([id, "all", params]), () => statement.all(...params))
    }
    this.#statements.set(sql, query)
    return query
  }

  #count(
    table: "artifact_sets" | "character_skill_parameter_groups" | "character_skill_parameters" | "characters" | "weapons"
  ): number {
    const row = this.#prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as unknown as CountRow
    return row.count
  }
}
