import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"
import { resolveCoreCombatStats } from "../../../src/core/base-stats.js"
import { evaluateCombatMetric } from "../../../src/metrics/evaluate.js"
import { evaluateScenario } from "../../../src/scenario/evaluate.js"

const db = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
afterAll(() => db.close())

function build(characterId: string, weaponId: string, constellation = 0): CharacterBuild {
  return { ...structuredClone(raidenNationalBuiltinBuild), characterId, buildId: `citlali-team.${characterId}`,
    artifacts: [], constellation, level: 90, ascension: 6, talents: { normal: 10, skill: 10, burst: 10 },
    weapon: { weaponId, refinement: 1, level: 90, ascension: 6 } }
}

function scenario(primary: CharacterBuild, actionId: string, teammates: CharacterBuild[]): EvaluationScenario {
  return { ...raidenNationalBuiltinScenario, primary, teammates, targetActionId: actionId, externalBuffs: [],
    conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" } }
}

const citlali = (constellation: number) => build("Citlali", "SacrificialFragments", constellation)
const diluc = build("Diluc", "WasterGreatsword")
const melt = "diluc.skill.searing_onslaught.third_hit.cryo_aura_melt"
const c1 = "citlali.constellation.1.blade_of_the_four_hundred_stars.base_damage"
const selfMastery = "citlali.constellation.2.heart_devourers_travail.self_elemental_mastery"
const sharedMastery = "citlali.constellation.2.heart_devourers_travail.on_field_elemental_mastery"
const resistance = "citlali.passive.mamaloaco_frigid_rain.pyro_hydro_resistance_reduction"
const c2Resistance = "citlali.constellation.2.heart_devourers_travail.pyro_hydro_resistance_reduction"

describe("Citlali cumulative team effects", () => {
  it("adds C1 to base damage using Citlali's final EM, and accumulates C2 and C6", () => {
    const baseMastery = resolveCoreCombatStats(citlali(0), db).elementalMastery
    let previousDamage = 0
    for (const constellation of [0, 1, 2, 6]) {
      const source = citlali(constellation)
      const result = evaluateScenario(scenario(diluc, melt, [source]), db)
      const effects = result.appliedEffects
      const expectedMastery = baseMastery + (constellation >= 2 ? 125 : 0)
      expect(result.stats.elementalMastery).toBe(constellation >= 2 ? 250 : 0)
      if (constellation >= 1) {
        expect(effects).toContainEqual(expect.objectContaining({ id: c1, target: "baseDamageFlat",
          sourceId: source.buildId, value: expectedMastery * 2 }))
      } else {
        expect(effects.some((effect) => effect.id === c1)).toBe(false)
      }
      expect(effects.some((effect) => effect.id === sharedMastery)).toBe(constellation >= 2)
      expect(effects.some((effect) => effect.id === selfMastery)).toBe(false)
      expect(effects.filter((effect) => effect.id === resistance || effect.id === c2Resistance)
        .reduce((total, effect) => total + effect.value, 0)).toBe(constellation >= 2 ? 0.4 : 0.2)
      const trace = result.rotation.events[0]!.trace
      const scaling = trace.find((step) => step.kind === "scaling")
      expect(scaling).toBeDefined()
      expect(scaling?.flatDamage ?? 0).toBe(constellation >= 1 ? expectedMastery * 2 : 0)
      expect(trace).toContainEqual(expect.objectContaining({ kind: "resistance",
        resistanceReduction: constellation >= 2 ? 0.4 : 0.2 }))
      expect(result.actionExpectedDamage).toBeGreaterThan(previousDamage)
      previousDamage = result.actionExpectedDamage
    }
  })

  it("keeps C2's own 125 EM on Citlali, including her shield, without granting herself C1 or 250 EM", () => {
    const shields: number[] = []
    const baseMastery = resolveCoreCombatStats(citlali(0), db).elementalMastery
    for (const constellation of [1, 2]) {
      const source = citlali(constellation)
      const result = evaluateScenario(scenario(source, "citlali.normal.auto.first_hit", [diluc]), db)
      expect(result.stats.elementalMastery).toBeCloseTo(baseMastery + (constellation >= 2 ? 125 : 0))
      expect(result.appliedEffects.some((effect) => effect.id === c1 || effect.id === sharedMastery)).toBe(false)
      const shield = evaluateCombatMetric({ build: source, gameData: db,
        context: { teammates: [diluc], recipient: { buildId: diluc.buildId, isWithinSourceArea: true } },
        metricId: "citlali.skill.dawnfrost_darkstar.opal_shield.base_absorption" })
      shields.push(shield.value)
    }
    expect(shields[1]! - shields[0]!).toBeCloseTo(125 * db.getCharacterSkillParameter("Citlali", "skill", 1, 10)!)
  })

  it("excludes foreground buffs from background Hydro damage, but retains enemy resistance reduction", () => {
    const yelan = build("Yelan", "HuntersBow")
    const source = citlali(6)
    const background = scenario(yelan, "yelan.burst.exquisite_throw.single_wave", [source, diluc])
    for (const onFieldBuildId of [undefined, source.buildId, diluc.buildId]) {
      const result = evaluateScenario({ ...background, conditions: { ...background.conditions,
        ...(onFieldBuildId ? { onFieldBuildId } : {}) } }, db)
      expect(result.stats.elementalMastery).toBe(0)
      expect(result.appliedEffects.some((effect) => effect.id === c1 || effect.id === sharedMastery)).toBe(false)
      for (const id of [resistance, c2Resistance]) {
        expect(result.appliedEffects).toContainEqual(expect.objectContaining({ id, value: 0.2 }))
      }
    }
  })

  it("prepares resistance reduction for unreacted Pyro/Hydro hits, but requires A1 and excludes Cryo", () => {
    const hydro = build("Barbara", "ApprenticesNotes")
    for (const [primary, actionId] of [[diluc, "diluc.skill.searing_onslaught.first_hit"],
      [hydro, "barbara.normal.auto.first_hit"]] as const) {
      const result = evaluateScenario(scenario(primary, actionId, [citlali(2)]), db)
      expect(result.appliedEffects.filter((effect) => effect.id === resistance || effect.id === c2Resistance))
        .toHaveLength(2)
      const locked = { ...citlali(2), level: 20, ascension: 0, talents: { normal: 1, skill: 1, burst: 1 } }
      const beforeAscension = evaluateScenario(scenario(primary, actionId, [locked]), db)
      expect(beforeAscension.appliedEffects.some((effect) => effect.id === resistance || effect.id === c2Resistance))
        .toBe(false)
    }
    const source = citlali(2)
    const cryo = evaluateScenario(scenario(source, "citlali.normal.auto.first_hit", [diluc]), db)
    expect(cryo.appliedEffects.some((effect) => effect.id === resistance || effect.id === c2Resistance)).toBe(false)
  })
})
