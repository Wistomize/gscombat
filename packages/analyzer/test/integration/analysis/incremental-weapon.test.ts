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

it.each([
  [raidenNationalBuiltinScenario, "TheCatch"],
  [swirl, "AThousandFloatingDreams"]
] as const)("matches complete analysis without recalculating unrelated comparisons (%s)", (scenario, weaponId) => {
  const original = structuredClone(scenario)
  const spy = vi.spyOn(evaluation, "evaluateScenario")
  const contextSpy = vi.spyOn(contexts, "resolveScenarioActionEffectContext")
  try {
    const full = evaluateScenarioAnalysis(scenario, db, { weaponComparisonRefinements: { [weaponId]: 2 } })
    expect(full.evaluation.actionExpectedDamage).toBe(full.analysis.baselineExpectedDamage)
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
