import { getCombatActionDefinition, raidenNationalBuiltinScenario } from "@gscombat/content"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, expect, it, vi } from "vitest"
import { AnalysisPreparation } from "../../../src/core/analysis-preparation.js"
import * as baseStats from "../../../src/core/base-stats.js"
import * as effects from "../../../src/effects/action-effects.js"
import { resolveScenarioSourceStatMaps } from "../../../src/evaluators/source-stats.js"
import { analyzeWeaponComparison } from "../../../src/analysis/analyze.js"
import { evaluateScenario } from "../../../src/scenario/evaluate.js"

const db = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
afterAll(() => db.close())

it("reuses pure inputs by build identity, element and repository without retaining another request", () => {
  const primary = structuredClone(raidenNationalBuiltinScenario.primary)
  const preparation = new AnalysisPreparation(db)
  const spy = vi.spyOn(baseStats, "resolveBaseCombatStats")
  const otherDb = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
  try {
    const initial = preparation.baseStats(primary, "electro", db)
    expect(preparation.baseStats(primary, "electro", db)).toBe(initial)
    expect(spy).toHaveBeenCalledTimes(1)
    const changed = { ...primary, level: 100 }
    expect(changed.buildId).toBe(primary.buildId)
    expect(preparation.baseStats(changed, "electro", db).baseAttack).not.toBe(initial.baseAttack)
    expect(preparation.baseStats(primary, "pyro", db)).not.toBe(initial)
    expect(spy).toHaveBeenCalledTimes(3)
    expect(Object.isFrozen(initial)).toBe(true)
    expect(() => preparation.baseStats(primary, "electro", otherDb)).toThrow("different game-data repository")
    expect(new AnalysisPreparation(db).baseStats(primary, "electro", db)).toEqual(initial)
    expect(spy).toHaveBeenCalledTimes(4)
  } finally { spy.mockRestore(); otherDb.close() }
})

it("prepares each source's automatic equipment once for HP, ATK, DEF and both mastery stages", () => {
  const scenario = structuredClone(raidenNationalBuiltinScenario)
  const action = getCombatActionDefinition(scenario.targetActionId)!
  const spy = vi.spyOn(effects, "resolveSelfAutomaticEquipmentEffects")
  try {
    const result = resolveScenarioSourceStatMaps({ action, primary: scenario.primary, teammates: scenario.teammates,
      gameData: db, buffs: scenario.externalBuffs, enemyCount: 1, activeEffectIds: scenario.conditions.activeEffectIds })
    const size = 1 + scenario.teammates.length
    expect(spy).toHaveBeenCalledTimes(size)
    for (const map of Object.values(result)) expect(map.size).toBe(size)
    expect(result.sourceFinalAttackByBuildId.get(scenario.primary.buildId)).toBeGreaterThan(0)
  } finally { spy.mockRestore() }
})

it("keeps A-B-A calls and equal build IDs isolated when a weapon changes team effects", () => {
  const a = structuredClone(raidenNationalBuiltinScenario)
  const b = { ...a, primary: { ...a.primary, weapon: { ...a.primary.weapon, weaponId: "TheCatch" } } }
  const original = structuredClone({ a, b })
  const first = analyzeWeaponComparison(a, db, "FavoniusLance", 5)
  const middle = analyzeWeaponComparison(b, db, "FavoniusLance", 5)
  expect(middle.baselineExpectedDamage).not.toBe(first.baselineExpectedDamage)
  expect(analyzeWeaponComparison(a, db, "FavoniusLance", 5)).toEqual(first)
  expect(evaluateScenario(a, db).actionExpectedDamage).toBe(first.baselineExpectedDamage)
  expect({ a, b }).toEqual(original)
})
