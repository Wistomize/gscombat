import { getCombatActionDefinition, raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, expect, it } from "vitest"
import { evaluateScenario } from "../../../src/scenario/evaluate.js"
import { resolveScenarioActionEffectContext } from "../../../src/evaluators/shared.js"

const db = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
afterAll(() => db.close())
const build = (characterId: string, weaponId = "FavoniusWarbow"): CharacterBuild => ({
  ...structuredClone(raidenNationalBuiltinBuild), characterId, buildId: `field.${characterId}`,
  artifacts: [], constellation: characterId === "Gorou" ? 6 : 0,
  talents: { normal: 10, skill: 10, burst: 10 },
  weapon: { weaponId, refinement: 1, level: 90, ascension: 6 }
})
const fieldDefense = "gorou.skill.field.defense_buff"
const partyDefense = "gorou.burst.general_glory.defense_percent_buff"
const c6 = "gorou.constellation.6.valorous_hound.three_or_more_geo.crit_damage"
const backgroundId = "linnea.skill.lumi.enhanced_hammer.lunar_crystallize"
const foregroundId = "linnea.skill.lumi.million_ton_hammer.lunar_crystallize"
const scenario: EvaluationScenario = {
  ...raidenNationalBuiltinScenario, primary: build("Linnea"),
  teammates: [build("Gorou"), build("Zhongli", "FavoniusLance")],
  targetActionId: backgroundId, externalBuffs: [],
  conditions: { activeEffectIds: [c6], enemyCount: 1, equipmentEffectMode: "maximum_reachable" }
}

it("excludes Gorou's field DEF from Linnea's background hit, retaining the party passive and C6", () => {
  const background = evaluateScenario(scenario, db)
  const foreground = evaluateScenario({ ...scenario, targetActionId: foregroundId }, db)
  expect(background.appliedEffects.map((effect) => effect.id)).not.toContain(fieldDefense)
  expect(background.appliedEffects.map((effect) => effect.id)).not.toContain("gorou.skill.field.geo_damage_bonus")
  for (const result of [background, foreground]) {
    expect(result.appliedEffects).toContainEqual(expect.objectContaining({ id: partyDefense, value: 0.25 }))
    expect(result.appliedEffects).toContainEqual(expect.objectContaining({ id: c6, value: 0.4 }))
    expect(result.rotation.events).toHaveLength(1)
  }
  const flatDefense = foreground.appliedEffects.find((effect) => effect.id === fieldDefense)!.value
  expect(foreground.stats.effectiveDefense - background.stats.effectiveDefense).toBeCloseTo(flatDefense)
  expect(background.stats.statContributions.some((entry) => entry.label === "大将旗指物 · 防御力提升")).toBe(false)
  const masteryRatio = db.getCharacterSkillParameter("Linnea", "passive2", 0, 1)!
  for (const result of [background, foreground]) {
    expect(result.appliedEffects.find((effect) => effect.id === "linnea.passive.defense_to_elemental_mastery")?.value)
      .toBeCloseTo(result.stats.effectiveDefense * masteryRatio)
  }
})

it("retains the real action owner when resolving another build's defense", () => {
  const context = (actionId: string, onFieldBuildId: string | null) => resolveScenarioActionEffectContext({
    fieldContext: { actionOwnerBuildId: scenario.primary.buildId, onFieldBuildId },
    action: getCombatActionDefinition(actionId)!, activeEffectIds: [fieldDefense, partyDefense],
    build: scenario.primary, teammates: scenario.teammates, buffs: [], enemyCount: 1, gameData: db,
    moonsignLevel: "nascent_gleam", resolvedActionParameters: new Map()
  })
  const gorouId = scenario.teammates[0]!.buildId
  const background = context(backgroundId, gorouId).sourceFinalDefenseByBuildId
  const foreground = context(foregroundId, scenario.primary.buildId).sourceFinalDefenseByBuildId
  const flatDefense = db.getCharacterSkillParameter("Gorou", "skill", 1, 13)!
  expect(foreground.get(scenario.primary.buildId)! - background.get(scenario.primary.buildId)!).toBeCloseTo(flatDefense)
  // Gorou receives the field's defense only when explicitly selected as the active teammate.
  expect(background.get(gorouId)! - foreground.get(gorouId)!).toBeCloseTo(flatDefense)
})

it("ignores an explicitly selected field buff on the background hit without mutating saved conditions", () => {
  const selected = { ...scenario, conditions: { ...scenario.conditions,
    activeEffectIds: [c6, fieldDefense, "gorou.skill.field.geo_damage_bonus"] } }
  const original = structuredClone(selected)
  const expected = evaluateScenario(scenario, db)
  const actual = evaluateScenario(selected, db)
  expect(actual.actionExpectedDamage).toBe(expected.actionExpectedDamage)
  expect(actual.stats).toEqual(expected.stats)
  expect(selected).toEqual(original)
})
