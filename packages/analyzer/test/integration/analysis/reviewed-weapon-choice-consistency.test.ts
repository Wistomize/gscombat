import { bennettNationalBuiltinBuild, getCombatActionDefinition, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, expect, it } from "vitest"
import { analyzeWeaponComparison, evaluateScenarioAnalysis } from "../../../src/analysis/analyze.js"
import { describeWeaponChoices } from "../../../src/effects/weapon-state.js"
import { evaluateScenario } from "../../../src/scenario/evaluate.js"

const db = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
afterAll(() => db.close())

const choices = { "mistsplitter-full-energy": "on" }
const scenario: EvaluationScenario = {
  ...raidenNationalBuiltinScenario,
  primary: {
    ...bennettNationalBuiltinBuild, buildId: "review.bennett.infusion", constellation: 6, artifacts: [],
    weapon: { weaponId: "MistsplitterReforged", level: 90, ascension: 6, refinement: 1 }
  },
  teammates: [], externalBuffs: [], targetActionId: "bennett.normal.auto.first_hit",
  conditions: { activeEffectIds: ["bennett.burst.field"], enemyCount: 1,
    weaponEffectChoices: { "review.bennett.infusion": choices } }
}

it("preserves a full-energy choice through Bennett C6 infusion in equipped, full, and single evaluation", () => {
  const original = structuredClone(scenario)
  expect(getCombatActionDefinition(scenario.targetActionId)?.element).toBe("physical")
  const catalog = describeWeaponChoices(scenario, db)
  expect(catalog.choices).toEqual(choices)
  expect(catalog.choiceGroups).toEqual([expect.objectContaining({ id: "mistsplitter-full-energy",
    options: [{ id: "off", label: "未满" }, { id: "on", label: "已满" }] })])

  const equipped = evaluateScenario(scenario, db)
  expect(equipped.rotation.events[0]?.element).toBe("pyro")
  expect(equipped.appliedEffects.filter((effect) => effect.id.startsWith("weapon.mistsplitter-reforged.prepared.")))
    .toEqual([expect.objectContaining({ id: "weapon.mistsplitter-reforged.prepared.pyro.full",
      sourceId: scenario.primary.buildId, value: 0.16 })])
  const full = evaluateScenarioAnalysis(scenario, db, {
    weaponComparisonChoices: { MistsplitterReforged: choices }
  })
  const row = full.analysis.weapons.find((weapon) => weapon.weaponId === "MistsplitterReforged")
  const single = analyzeWeaponComparison(scenario, db, "MistsplitterReforged", 1, choices)
  const inherited = analyzeWeaponComparison(scenario, db, "MistsplitterReforged", 1)
  expect(row).toMatchObject({ choices, expectedDamage: equipped.actionExpectedDamage, gainRatio: 0 })
  expect(single.weapon).toEqual(row)
  expect(inherited.weapon).toEqual(row)
  expect(full.analysis.baselineExpectedDamage).toBe(equipped.actionExpectedDamage)
  expect(single.baselineExpectedDamage).toBe(equipped.actionExpectedDamage)
  expect(scenario).toEqual(original)
})

it.each([
  ["without the selected field", 6, []],
  ["below the infusion constellation", 5, ["bennett.burst.field"]]
] as const)("does not offer an elemental weapon choice for physical damage %s", (_label, constellation, activeEffectIds) => {
  const physical: EvaluationScenario = { ...scenario, primary: { ...scenario.primary, constellation },
    conditions: { ...scenario.conditions, activeEffectIds: [...activeEffectIds] } }
  expect(describeWeaponChoices(physical, db).choiceGroups).toEqual([])
  const result = evaluateScenario(physical, db)
  expect(result.rotation.events[0]?.element).toBe("physical")
  expect(result.appliedEffects.some((effect) => effect.id.startsWith("weapon.mistsplitter-reforged.prepared."))).toBe(false)
})

it("does not expose native-element emblems when a teammate infuses a different element", () => {
  const alhaitham: EvaluationScenario = {
    ...scenario,
    primary: { ...scenario.primary, buildId: "review.alhaitham", characterId: "Alhaitham", constellation: 0 },
    teammates: [{ ...scenario.primary, weapon: { ...scenario.primary.weapon, weaponId: "FavoniusSword" } }],
    targetActionId: "alhaitham.normal.auto.first_hit",
    conditions: { activeEffectIds: ["bennett.burst.field"], enemyCount: 1 }
  }
  expect(describeWeaponChoices(alhaitham, db).choiceGroups).toEqual([])
  const result = evaluateScenario(alhaitham, db)
  expect(result.rotation.events[0]?.element).toBe("pyro")
  expect(result.appliedEffects.some((effect) => effect.id.startsWith("weapon.mistsplitter-reforged.prepared."))).toBe(false)
  expect(result.appliedEffects).toContainEqual(expect.objectContaining({
    id: "weapon.mistsplitter-reforged.all-element-damage-bonus", value: 0.12
  }))
})
