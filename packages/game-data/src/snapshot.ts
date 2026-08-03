import { mkdirSync, renameSync, rmSync } from "node:fs"
import { dirname } from "node:path"
import { DatabaseSync, type StatementSync } from "node:sqlite"

import { GAME_DATA_SCHEMA, GAME_DATA_SCHEMA_VERSION } from "./schema.js"
import type { GameDataSourceManifest, GiStatsDocument, StatCurveSource } from "./types.js"

export interface CreateGameDataSnapshotInput {
  readonly databasePath: string
  readonly document: GiStatsDocument
  readonly manifest: GameDataSourceManifest
}

function insertMetadata(database: DatabaseSync, manifest: GameDataSourceManifest): void {
  database.prepare("INSERT INTO metadata (key, value) VALUES (?, ?)").run("source_manifest", JSON.stringify(manifest))
}

function insertStatCurves(
  statement: StatementSync,
  ownerId: string,
  curves: readonly StatCurveSource[] | undefined
): void {
  for (const curve of curves ?? []) {
    if (!curve.key) continue
    statement.run(ownerId, curve.key, curve.base, curve.curve)
  }
}

function insertAscensionBonuses(
  statement: StatementSync,
  ownerId: string,
  bonuses: Readonly<Record<string, readonly number[]>> | undefined
): void {
  for (const [stat, values] of Object.entries(bonuses ?? {})) {
    values.forEach((value, ascension) => statement.run(ownerId, stat, ascension, value))
  }
}

function insertLevelCurves(statement: StatementSync, curves: Readonly<Record<string, readonly number[]>>): void {
  for (const [curveId, values] of Object.entries(curves)) {
    values.forEach((multiplier, level) => {
      if (level > 0) statement.run(curveId, level, multiplier)
    })
  }
}

function isNumberArray(value: unknown): value is readonly number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number")
}

function isNumberMatrix(value: unknown): value is readonly (readonly number[])[] {
  return Array.isArray(value) && value.every(isNumberArray)
}

function isPublicPlayableCharacterId(characterId: string): boolean {
  // Genshin Optimizer includes Somnia as a non-playable OC/easter-egg record.
  // Public GSCombat snapshots contain playable static characters only.
  return characterId !== "Somnia"
}

function insertCharacters(database: DatabaseSync, document: GiStatsDocument): void {
  const characterStatement = database.prepare(`
    INSERT INTO characters (
      id, element, region, weapon_type, rarity, birthday_month, birthday_day, raw_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const statCurveStatement = database.prepare(`
    INSERT INTO character_stat_curves (character_id, stat, base_value, curve_id) VALUES (?, ?, ?, ?)
  `)
  const ascensionStatement = database.prepare(`
    INSERT INTO character_ascension_bonuses (character_id, stat, ascension, value) VALUES (?, ?, ?, ?)
  `)
  const skillStatement = database.prepare(`
    INSERT INTO character_skill_parameters (
      character_id, skill, parameter_index, talent_level, value
    ) VALUES (?, ?, ?, ?, ?)
  `)
  const skillGroupStatement = database.prepare(`
    INSERT INTO character_skill_parameter_groups (character_id, group_id, values_json) VALUES (?, ?, ?)
  `)
  const levelCurveStatement = database.prepare(`
    INSERT INTO character_level_curves (curve_id, level, multiplier) VALUES (?, ?, ?)
  `)

  for (const [characterId, character] of Object.entries(document.char.data)) {
    if (!isPublicPlayableCharacterId(characterId)) continue
    characterStatement.run(
      characterId,
      character.ele ?? null,
      character.region ?? null,
      character.weaponType,
      character.rarity,
      character.birthday?.month ?? null,
      character.birthday?.day ?? null,
      JSON.stringify(character)
    )
    insertStatCurves(statCurveStatement, characterId, character.lvlCurves)
    insertAscensionBonuses(ascensionStatement, characterId, character.ascensionBonus)
  }

  for (const [characterId, skills] of Object.entries(document.char.skillParam)) {
    if (!isPublicPlayableCharacterId(characterId)) continue
    for (const [skill, parameters] of Object.entries(skills)) {
      skillGroupStatement.run(characterId, skill, JSON.stringify(parameters))
      if (!isNumberMatrix(parameters)) continue
      parameters.forEach((values, parameterIndex) => {
        values.forEach((value, levelIndex) => skillStatement.run(characterId, skill, parameterIndex, levelIndex + 1, value))
      })
    }
  }

  insertLevelCurves(levelCurveStatement, document.char.expCurve)
}

function insertRefinementParameters(statement: StatementSync, weaponId: string, parameters: unknown): void {
  if (typeof parameters !== "object" || parameters === null) return

  for (const [parameter, values] of Object.entries(parameters)) {
    if (!isNumberArray(values)) continue
    // gi-stats reserves index zero as a -1 placeholder because refinements begin at R1.
    const refinementValues = values[0] === -1 ? values.slice(1) : values
    refinementValues.forEach((value, refinementIndex) => {
      statement.run(weaponId, parameter, refinementIndex + 1, value)
    })
  }
}

function insertWeapons(database: DatabaseSync, document: GiStatsDocument): void {
  const weaponStatement = database.prepare(`
    INSERT INTO weapons (id, weapon_type, rarity, raw_json) VALUES (?, ?, ?, ?)
  `)
  const statCurveStatement = database.prepare(`
    INSERT INTO weapon_stat_curves (weapon_id, stat, base_value, curve_id) VALUES (?, ?, ?, ?)
  `)
  const ascensionStatement = database.prepare(`
    INSERT INTO weapon_ascension_bonuses (weapon_id, stat, ascension, value) VALUES (?, ?, ?, ?)
  `)
  const refinementStatement = database.prepare(`
    INSERT INTO weapon_refinement_parameters (weapon_id, parameter, refinement, value) VALUES (?, ?, ?, ?)
  `)
  const levelCurveStatement = database.prepare(`
    INSERT INTO weapon_level_curves (curve_id, level, multiplier) VALUES (?, ?, ?)
  `)

  for (const [weaponId, weapon] of Object.entries(document.weapon.data)) {
    weaponStatement.run(weaponId, weapon.weaponType, weapon.rarity, JSON.stringify(weapon))
    insertStatCurves(statCurveStatement, weaponId, weapon.lvlCurves)
    insertAscensionBonuses(ascensionStatement, weaponId, weapon.ascensionBonus)
    insertRefinementParameters(refinementStatement, weaponId, weapon.refinementBonus)
  }

  insertLevelCurves(levelCurveStatement, document.weapon.expCurve)
}

function insertArtifactStatTable(
  statement: StatementSync,
  table: Readonly<Record<string, Readonly<Record<string, readonly number[]>>>>
): void {
  for (const [rarity, stats] of Object.entries(table)) {
    for (const [stat, values] of Object.entries(stats)) {
      values.forEach((value, index) => statement.run(Number(rarity), stat, index, value))
    }
  }
}

function insertArtifacts(database: DatabaseSync, document: GiStatsDocument): void {
  const setStatement = database.prepare(`
    INSERT INTO artifact_sets (id, set_bonuses_json, rarities_json, slots_json, raw_json) VALUES (?, ?, ?, ?, ?)
  `)
  const mainStatStatement = database.prepare(`
    INSERT INTO artifact_main_stats (rarity, stat, level, value) VALUES (?, ?, ?, ?)
  `)
  const substatStatement = database.prepare(`
    INSERT INTO artifact_substat_rolls (rarity, stat, tier, value) VALUES (?, ?, ?, ?)
  `)
  const rollMetadataStatement = database.prepare(`
    INSERT INTO artifact_roll_metadata (key, value_json) VALUES (?, ?)
  `)

  for (const [setId, artifactSet] of Object.entries(document.art.data)) {
    setStatement.run(
      setId,
      JSON.stringify(artifactSet.setNum),
      JSON.stringify(artifactSet.rarities),
      JSON.stringify(artifactSet.slots),
      JSON.stringify(artifactSet)
    )
  }

  insertArtifactStatTable(mainStatStatement, document.art.main)
  insertArtifactStatTable(substatStatement, document.art.sub)
  rollMetadataStatement.run("sub_roll", JSON.stringify(document.art.subRoll))
  rollMetadataStatement.run("sub_roll_correction", JSON.stringify(document.art.subRollCorrection))
}

/** Creates an atomic, versioned SQLite snapshot from a normalized gi-stats document. */
export function createGameDataSnapshot(input: CreateGameDataSnapshotInput): void {
  if (input.manifest.schemaVersion !== GAME_DATA_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported game-data schema version ${input.manifest.schemaVersion}; expected ${GAME_DATA_SCHEMA_VERSION}`
    )
  }

  mkdirSync(dirname(input.databasePath), { recursive: true })
  const temporaryPath = `${input.databasePath}.tmp`
  rmSync(temporaryPath, { force: true })
  const database = new DatabaseSync(temporaryPath)

  try {
    database.exec("PRAGMA journal_mode = DELETE; PRAGMA synchronous = FULL;")
    database.exec(GAME_DATA_SCHEMA)
    database.exec("BEGIN IMMEDIATE")
    insertMetadata(database, input.manifest)
    insertCharacters(database, input.document)
    insertWeapons(database, input.document)
    insertArtifacts(database, input.document)
    database.exec("COMMIT")
    database.exec("PRAGMA optimize; VACUUM;")
    database.close()
    renameSync(temporaryPath, input.databasePath)
  } catch (error) {
    if (database.isOpen) {
      try {
        database.exec("ROLLBACK")
      } catch {
        // The transaction may not have started yet.
      }
      database.close()
    }
    rmSync(temporaryPath, { force: true })
    throw error
  }
}
