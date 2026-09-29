import type { DatabaseSync } from "node:sqlite"
import type { ArtifactSetSource, CharacterSource, GiStatsDocument, WeaponSource } from "../../src/types.js"
import { COMMIT, data, number, object, refinementNumber, text, type Mappings } from "./input.js"

const statKeys: Record<string, string> = {
  FIGHT_PROP_HP_PERCENT: "hp_", FIGHT_PROP_ATTACK_PERCENT: "atk_", FIGHT_PROP_DEFENSE_PERCENT: "def_",
  FIGHT_PROP_CRITICAL: "critRate_", FIGHT_PROP_CRITICAL_HURT: "critDMG_",
  FIGHT_PROP_CHARGE_EFFICIENCY: "enerRech_", FIGHT_PROP_ELEMENT_MASTERY: "eleMas",
  FIGHT_PROP_HEAL_ADD: "heal_", FIGHT_PROP_PHYSICAL_ADD_HURT: "physical_dmg_",
  FIGHT_PROP_FIRE_ADD_HURT: "pyro_dmg_", FIGHT_PROP_WATER_ADD_HURT: "hydro_dmg_",
  FIGHT_PROP_ICE_ADD_HURT: "cryo_dmg_", FIGHT_PROP_ELEC_ADD_HURT: "electro_dmg_",
  FIGHT_PROP_WIND_ADD_HURT: "anemo_dmg_", FIGHT_PROP_ROCK_ADD_HURT: "geo_dmg_",
  FIGHT_PROP_GRASS_ADD_HURT: "dendro_dmg_"
}
const weaponKeys: Record<string, string> = {
  WEAPON_SWORD_ONE_HAND: "sword", WEAPON_CLAYMORE: "claymore", WEAPON_POLE: "polearm",
  WEAPON_BOW: "bow", WEAPON_CATALYST: "catalyst"
}
const regionKeys: Record<string, string> = {
  "挪德卡莱": "nodKrai", "蒙德": "mondstadt", "须弥": "sumeru", "稻妻": "inazuma",
  "至冬": "snezhnaya", "璃月": "liyue", "枫丹": "fontaine", "纳塔": "natlan"
}
export interface ImportIssue { category: string; entity: string; detail: string }
export interface Normalized {
  document: GiStatsDocument
  issues: ImportIssue[]
  refinements: { weapon: string; refinement: number; literals: unknown[]; values: (number | null)[] }[]
}
function statKey(value: unknown): string {
  const result = statKeys[text(value)]
  if (!result) throw new Error(`Unknown specialized stat: ${value}`)
  return result
}
function curves(input: Record<string, unknown>): Record<string, number[]> {
  const result: Record<string, number[]> = {}
  for (const [level, row] of Object.entries(input)) for (const [key, value] of Object.entries(object(row))) {
    const values = result[key] ??= [0]
    values[Number(level)] = number(value)
  }
  for (const values of Object.values(result)) {
    for (let i = 1; i < values.length; i++) number(values[i])
  }
  return result
}

/** Builds a research document without inheriting missing talents or passives from the baseline. */
export function normalize(inputs: Map<string, unknown>, mappings: Mappings, baseline: DatabaseSync): Normalized {
  if (mappings.commit !== COMMIT) throw new Error("Mapping commit does not match source")
  const issues: ImportIssue[] = []
  const characters: Record<string, CharacterSource> = {}
  const weapons: Record<string, WeaponSource> = {}
  const skillParam: Record<string, Record<string, number[][]>> = {}
  const artifacts: Record<string, ArtifactSetSource> = {}
  const refined: Normalized["refinements"] = []
  for (const [kind, entities] of [["characters", mappings.characters], ["weapons", mappings.weapons]] as const) {
    const stats = data(inputs, `stats/${kind}`)
    for (const { id, key } of entities) {
      const source = object(stats[key])
      const labels = data(inputs, `ChineseSimplified/${kind}/${key}`)
      const base = object(source.base), curve = object(source.curve)
      const promotions = (source.promotion as unknown[]).map(object)
      const weaponType = weaponKeys[text(labels.weaponType)]
      if (!weaponType) throw new Error(`Unknown weapon type for ${id}`)
      const pairs = kind === "characters" ? [["hp", "hp"], ["atk", "attack"], ["def", "defense"]] : [["atk", "attack"]]
      const lvlCurves = pairs.map(([target, original]) => ({ key: target!, base: number(base[original!]), curve: text(curve[original!]) }))
      const ascensionBonus = Object.fromEntries(pairs.map(([target, original]) => [target!, promotions.map(p => number(p[original!]))]))
      if (source.specialized) {
        const key = statKey(source.specialized)
        if (kind === "characters") ascensionBonus[key] = promotions.map(p => number(p.specialized))
        else lvlCurves.push({ key, base: number(base.specialized), curve: text(curve.specialized) })
      }
      const common = { rarity: number(labels.rarity), weaponType, lvlCurves, ascensionBonus }
      if (kind === "characters") {
        const [month, day] = String(labels.birthdaymmdd ?? "").split("/").map(Number)
        const region = regionKeys[String(labels.region ?? "")]
        if (labels.region && !region) issues.push({ category: "unknown-region", entity: id, detail: String(labels.region) })
        characters[id] = { ...common, key: id, baseStats: {}, ...(id === "Traveler" ? {} : {
          ele: text(labels.elementType).replace("ELEMENT_", "").toLowerCase(),
          ...(month && day ? { birthday: { month, day } } : {}),
          ...(region ? { region } : {})
        }) }
      } else {
        weapons[id] = common
        for (let refinement = 1; refinement <= 5; refinement++) {
          const value = labels[`r${refinement}`]
          if (!value) continue
          const values = object(value).values
          if (!Array.isArray(values)) throw new Error(`Missing refinement values: ${id}`)
          refined.push({ weapon: id, refinement, literals: values, values: values.map(value => {
            try { return refinementNumber(value) } catch {
              issues.push({ category: "ambiguous-refinement-literal", entity: `${id}/R${refinement}`, detail: String(value) })
              return null
            }
          }) })
        }
      }
    }
  }
  const talents = data(inputs, "stats/talents")
  for (const mapping of mappings.talents) {
    if (!mapping.evidence) throw new Error("Mapping evidence is required")
    if (mapping.status === "blocked-source-mismatch") {
      issues.push({ category: "source-vector-mismatch", entity: `${mapping.owner}/${mapping.group}`, detail: mapping.evidence })
      continue
    }
    const source = object(object(talents[mapping.key])[mapping.sourceGroup])
    const labels = object(object(data(inputs, `ChineseSimplified/talents/${mapping.key}`)[mapping.sourceGroup]).attributes).labels
    if (!Array.isArray(labels)) throw new Error("Missing labels")
    const values: number[][] = []
    for (const parameter of mapping.parameters) {
      if (values[parameter.index]) throw new Error("Duplicate target parameter")
      if (!parameter.labels.every(label => labels.includes(label))) throw new Error("Mapping label drift")
      if (parameter.labels.length && !parameter.labels.some(label => label.includes(`{${parameter.key}:`))) {
        throw new Error("Label does not reference parameter")
      }
      if (!parameter.labels.length) issues.push({ category: "source-label-missing",
        entity: `${mapping.owner}/${mapping.group}/${parameter.index}`, detail: `${mapping.key}/${mapping.sourceGroup}/${parameter.key}` })
      const raw = source[parameter.key]
      if (!Array.isArray(raw) || !raw.length || (mapping.group !== "sprint" && raw.length !== 15)) {
        throw new Error("Unexpected source level count")
      }
      values[parameter.index] = raw.map(number)
    }
    for (let i = 0; i < values.length; i++) if (!values[i]) throw new Error("Sparse target mapping forbidden")
    if (mapping.status === "vector-verified") {
      const row = baseline.prepare("SELECT values_json FROM character_skill_parameter_groups WHERE character_id=? AND group_id=?")
        .get(mapping.owner, mapping.group)
      if (!row || JSON.stringify(values) !== text(row.values_json)) {
        throw new Error(`Vector verification drift: ${mapping.owner}/${mapping.group}`)
      }
    }
    const groups = skillParam[mapping.owner] ??= {}
    if (groups[mapping.group]) throw new Error("Duplicate target group")
    groups[mapping.group] = values
  }
  for (const mapping of mappings.refinements) {
    const parameters: Record<string, number[]> = {}
    for (const parameter of mapping.parameters) {
      parameters[parameter.name] = Array.from({ length: 5 }, (_, i) => {
        const row = refined.find(r => r.weapon === mapping.id && r.refinement === i + 1)
        return number(row?.values[parameter.index])
      })
    }
    weapons[mapping.id] = { ...weapons[mapping.id]!, refinementBonus: parameters }
  }
  for (const { id, key } of mappings.artifacts) {
    const source = data(inputs, `ChineseSimplified/artifacts/${key}`)
    artifacts[id] = { rarities: (source.rarityList as unknown[]).map(number),
      setNum: [1, 2, 4].filter(n => source[`effect${n}Pc`] !== undefined),
      slots: ["flower", "plume", "sands", "goblet", "circlet"].filter(s => source[s] !== undefined) }
  }
  const artifactTable = (table: string, index: string) => {
    const result: Record<string, Record<string, number[]>> = {}
    for (const r of baseline.prepare(`SELECT * FROM ${table}`).all()) {
      const values = (result[String(r.rarity)] ??= {})[String(r.stat)] ??= []
      values[Number(r[index])] = number(r.value)
    }
    return result
  }
  const metadata = (key: string): unknown => {
    const row = baseline.prepare("SELECT value_json FROM artifact_roll_metadata WHERE key=?").get(key)
    if (!row) throw new Error(`Missing inherited artifact metadata ${key}`)
    return JSON.parse(text(row.value_json))
  }
  for (const row of baseline.prepare("SELECT id, raw_json FROM characters").all()) {
    const inherited = object(object(JSON.parse(text(row.raw_json))).baseStats ?? {})
    if (Object.keys(inherited).length) issues.push({ category: "missing-inherent-stats", entity: text(row.id), detail: JSON.stringify(inherited) })
  }
  for (const [kind, entities] of [["characters", mappings.characters], ["weapons", mappings.weapons], ["artifacts", mappings.artifacts]] as const) {
    const source = data(inputs, `version/${kind}`)
    const keys = new Set(entities.map(e => e.key))
    for (const key of Object.keys(source).sort()) if (!keys.has(key)) {
      issues.push({ category: "unmapped-source-entity", entity: `${kind}/${key}`, detail: String(source[key]) })
    }
  }
  return { issues, refinements: refined, document: {
    char: { data: characters, skillParam, expCurve: curves(data(inputs, "curve/characters")) },
    weapon: { data: weapons, expCurve: curves(data(inputs, "curve/weapons")) },
    art: { data: artifacts, main: artifactTable("artifact_main_stats", "level"), sub: artifactTable("artifact_substat_rolls", "tier"),
      subRoll: metadata("sub_roll"), subRollCorrection: metadata("sub_roll_correction") }
  } }
}
