import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, expect, it, vi } from "vitest"
import { analyzeWeaponComparison, evaluateScenarioAnalysis } from "../../../src/analysis/analyze.js"
import * as evaluation from "../../../src/scenario/evaluate.js"
import * as contexts from "../../../src/evaluators/shared.js"

const db = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
afterAll(() => db.close())
const build = (characterId: string, weaponId: string) => ({
  ...raidenNationalBuiltinBuild, buildId: `test.${characterId}`, characterId, constellation: 6,
  weapon: { weaponId, level: 90, ascension: 6, refinement: 1 }
})
const swirl: EvaluationScenario = {
  ...raidenNationalBuiltinScenario,
  primary: build("YumemizukiMizuki", "FavoniusCodex"),
  teammates: [build("Odette", "FavoniusSword"), build("Faruzan", "FavoniusWarbow"), build("Diona", "FavoniusWarbow")],
  externalBuffs: [],
  conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable", actionParameters: { vortex_level: 6 } },
  targetActionId: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl_vortex"
}

const linnea: EvaluationScenario = {
  ...raidenNationalBuiltinScenario, primary: build("Linnea", "FavoniusWarbow"),
  teammates: [build("Gorou", "FavoniusWarbow")], externalBuffs: [],
  conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
  targetActionId: "linnea.skill.lumi.enhanced_hammer.lunar_crystallize"
}

it.each([
  [raidenNationalBuiltinScenario, "TheCatch"],
  [linnea, "AlleyHunter"],
  [swirl, "AThousandFloatingDreams"]
] as const)("matches complete analysis without recalculating unrelated comparisons (%s)", (scenario, weaponId) => {
  const original = structuredClone(scenario)
  const spy = vi.spyOn(evaluation, "evaluatePreparedScenario")
  const contextSpy = vi.spyOn(contexts, "resolveScenarioActionEffectContext")
  try {
    const full = evaluateScenarioAnalysis(scenario, db, { weaponComparisonRefinements: { [weaponId]: 2 } })
    expect(full.evaluation.actionExpectedDamage).toBe(full.analysis.baselineExpectedDamage)
    expect(full.analysis.weapons.some((weapon) => weapon.weaponId.startsWith("Royal"))).toBe(false)
    expect(spy).toHaveBeenCalledTimes(1 + full.analysis.weapons.length + full.analysis.marginalSubstats.length + full.analysis.progressionGains.length)
    spy.mockClear()
    contextSpy.mockClear()
    const single = analyzeWeaponComparison(scenario, db, weaponId, 2)
    expect(spy).toHaveBeenCalledTimes(2)
    if (scenario === swirl) expect(contextSpy).toHaveBeenCalledTimes(2)
    expect(single).toEqual({ baselineExpectedDamage: full.analysis.baselineExpectedDamage,
      weapon: full.analysis.weapons.find((weapon) => weapon.weaponId === weaponId) })
    expect(scenario).toEqual(original)
  } finally { spy.mockRestore(); contextSpy.mockRestore() }
})

it("rejects an excluded Royal candidate while retaining an already equipped Royal weapon", () => {
  const scenario: EvaluationScenario = { ...raidenNationalBuiltinScenario,
    primary: { ...raidenNationalBuiltinScenario.primary,
      weapon: { weaponId: "RoyalSpear", refinement: 1, level: 90, ascension: 6 } } }
  const original = structuredClone(scenario)
  const alternative = analyzeWeaponComparison(scenario, db, "TheCatch", 5)
  expect(alternative.baselineExpectedDamage).toBeGreaterThan(0)
  expect(() => analyzeWeaponComparison(scenario, db, "RoyalSpear", 5)).toThrow("当前场景无法比较武器：RoyalSpear")
  expect(scenario).toEqual(original)
})

it("compares a three-star weapon and applies explicit choices without changing the baseline", () => {
  const scenario: EvaluationScenario = { ...raidenNationalBuiltinScenario,
    primary: build("Neuvillette", "LostPrayerToTheSacredWinds"), teammates: [], externalBuffs: [],
    targetActionId: "neuvillette.normal.charged_attack.equitable_judgment.single_tick",
    conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" } }
  const choices = { "lost-prayer-movement": "0-stack" }
  const full = evaluateScenarioAnalysis(scenario, db, { weaponComparisonChoices: { LostPrayerToTheSacredWinds: choices } })
  const single = analyzeWeaponComparison(scenario, db, "LostPrayerToTheSacredWinds", 1, choices)
  expect(single.weapon).toEqual(full.analysis.weapons.find((weapon) => weapon.weaponId === "LostPrayerToTheSacredWinds"))
  expect(single.weapon.gainRatio).toBeLessThan(0)
  expect(single.weapon.choices).toEqual(choices)
  expect(single.baselineExpectedDamage).toBe(full.analysis.baselineExpectedDamage)
  const threeStar = full.analysis.weapons.find((weapon) => weapon.weaponId === "MagicGuide")
  expect(threeStar).toMatchObject({ rarity: 3, refinement: 5 })
  expect(analyzeWeaponComparison(scenario, db, "MagicGuide", 5).weapon).toEqual(threeStar)
  expect(() => analyzeWeaponComparison(scenario, db, "LostPrayerToTheSacredWinds", 1,
    { "lost-prayer-movement": "5-stack" })).toThrow("武器条件无效")
})
