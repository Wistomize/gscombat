import { afterAll, expect, it } from "vitest"
import { listCombatActionEffects, raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { analyzeWeaponComparison, evaluateScenarioAnalysis } from "../../../src/analysis/analyze.js"
import { evaluateScenario } from "../../../src/scenario/evaluate.js"

const db = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
afterAll(() => db.close())
const jadeIds = ["weapon.sacrificial-jade.after-off-field.hp-percent", "weapon.sacrificial-jade.after-off-field.elemental-mastery"]
const fullClearId = "weapon.flowing-purity.bond-of-life-cleared.full-clear.all-element-damage-bonus"
const scenario = (characterId: string, targetActionId: string): EvaluationScenario => ({
  ...raidenNationalBuiltinScenario,
  primary: { ...structuredClone(raidenNationalBuiltinBuild), buildId: `defaults.${characterId}`, characterId,
    constellation: 6, weapon: { weaponId: characterId === "Furina" ? "FavoniusSword" :
      characterId === "Diluc" ? "FavoniusGreatsword" : characterId === "Fischl" ? "FavoniusWarbow" : "FavoniusCodex",
      refinement: 1, level: 90, ascension: 6 } },
  teammates: [], externalBuffs: [], targetActionId,
  conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" }
})
const neuvillette = scenario("Neuvillette", "neuvillette.normal.charged_attack.equitable_judgment.single_tick")
const equip = (input: EvaluationScenario, weaponId: string, refinement = 5): EvaluationScenario => ({
  ...input, primary: { ...input.primary, weapon: { weaponId, refinement, level: 90, ascension: 6 } }
})

it.each([1, 5])("keeps both Jade bonuses at R%i without changing the caller or the baseline", (refinement) => {
  const original = structuredClone(neuvillette)
  const equipped = equip(neuvillette, "SacrificialJade", refinement)
  const inactive = evaluateScenario(equipped, db)
  const active = evaluateScenario({ ...equipped, conditions: { ...equipped.conditions, activeEffectIds: jadeIds } }, db)
  expect(active.stats.elementalMastery - inactive.stats.elementalMastery).toBe(refinement === 1 ? 40 : 80)
  expect(active.stats.hpPercent - inactive.stats.hpPercent).toBeCloseTo(refinement === 1 ? 0.32 : 0.64)
  const compared = analyzeWeaponComparison(neuvillette, db, "SacrificialJade", refinement)
  expect(compared.weapon.expectedDamage).toBe(active.actionExpectedDamage)
  expect(compared.baselineExpectedDamage).toBe(evaluateScenario(neuvillette, db).actionExpectedDamage)
  expect(neuvillette).toEqual(original)
  const alreadySelected = { ...equipped, conditions: { ...equipped.conditions, activeEffectIds: jadeIds } }
  expect(analyzeWeaponComparison(alreadySelected, db, "SacrificialJade", refinement).weapon.expectedDamage).toBe(active.actionExpectedDamage)
})

it.each([1, 5])("calculates a full 24%% bond from actual HP with a continuous capped bonus at R%i", (refinement) => {
  for (const extraHp of [0, 20000]) {
    const input = equip({ ...neuvillette, externalBuffs: [{ sourceId: "test.hp", label: "生命测试", stat: "hp_flat", value: extraHp }] }, "FlowingPurity", refinement)
    const evaluated = evaluateScenario(input, db)
    const expected = Math.min(evaluated.stats.effectiveHp * 0.24 / 1000 * (refinement === 1 ? 0.02 : 0.04), refinement === 1 ? 0.12 : 0.24)
    const effect = evaluated.appliedEffects.find((effect) => effect.id === fullClearId)
    expect(effect?.value).toBeCloseTo(expected, 12)
    expect(evaluated.stats.statContributions).toContainEqual(expect.objectContaining({ label: effect!.label, stage: "damageBonus", value: effect!.value }))
    expect(analyzeWeaponComparison(input, db, "FlowingPurity", refinement).weapon.expectedDamage).toBe(evaluated.actionExpectedDamage)
    if (extraHp === 0) expect(expected).toBeLessThan(refinement === 1 ? 0.12 : 0.24)
    else expect(expected).toBe(refinement === 1 ? 0.12 : 0.24)
  }
})

it("replaces legacy partial-clear choices in comparisons and removes old weapon defaults when switching", () => {
  const input = equip(neuvillette, "FlowingPurity")
  const legacy = { ...input, conditions: { ...input.conditions, activeEffectIds: ["weapon.flowing-purity.bond-of-life-cleared.1-thousand-points.all-element-damage-bonus"] } }
  expect(analyzeWeaponComparison(legacy, db, "FlowingPurity", 5).weapon.expectedDamage).toBe(evaluateScenario(input, db).actionExpectedDamage)
  const selected = { ...input, conditions: { ...input.conditions, activeEffectIds: [fullClearId, "weapon.flowing-purity.after-skill.all-element-damage-bonus"] } }
  expect(analyzeWeaponComparison(selected, db, "SacrificialJade", 5).weapon.expectedDamage).toBe(analyzeWeaponComparison(neuvillette, db, "SacrificialJade", 5).weapon.expectedDamage)
})

it.each([
  ["Neuvillette", neuvillette.targetActionId, "TomeOfTheEternalFlow", "3-stack"],
  ["Wriothesley", "wriothesley.normal.rebuke_vaulting_fist.c6_maximum_reachable", "CashflowSupervision", "3-stack"],
  ["Furina", "furina.skill.salon_solitaire.mademoiselle_crabaletta.single_hit", "SplendorOfTranquilWaters", ""]
])("applies authored signature defaults only to %s", (characterId, actionId, weaponId, stack) => {
  const input = scenario(characterId, actionId)
  if (characterId === "Furina") input.teammates.push(structuredClone(raidenNationalBuiltinBuild))
  const ids = listCombatActionEffects().filter((effect) => effect.source.kind === "weapon" && effect.source.weaponId === weaponId &&
    effect.weaponComparisonDefault && effect.id.includes(stack)).map((effect) => effect.id)
  expect(ids.length).toBeGreaterThan(0)
  const explicit = equip({ ...input, conditions: { ...input.conditions, activeEffectIds: ids } }, weaponId, 1)
  expect(analyzeWeaponComparison(input, db, weaponId, 1).weapon.expectedDamage).toBe(evaluateScenario(explicit, db).actionExpectedDamage)
  if (weaponId !== "SplendorOfTranquilWaters") {
    const nonOwner = scenario("YumemizukiMizuki", "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.radiance_stellar_swirl_combo")
    expect(analyzeWeaponComparison(nonOwner, db, weaponId, 1).weapon.expectedDamage).toBe(evaluateScenario(equip(nonOwner, weaponId, 1), db).actionExpectedDamage)
  }
})

it("defaults Mappa stacks for reaction outputs, not an arbitrary no-reaction action", () => {
  const noReaction = equip(neuvillette, "MappaMare")
  expect(analyzeWeaponComparison(neuvillette, db, "MappaMare", 5).weapon.expectedDamage).toBe(evaluateScenario(noReaction, db).actionExpectedDamage)
  const input = scenario("Yanfei", "yanfei.normal.charged_attack.three_scarlet_seals.hydro_aura_vaporize")
  const explicit = equip({ ...input, conditions: { ...input.conditions,
    activeEffectIds: ["weapon.mappa-mare.infusion-scroll.2-stack.all-element-damage-bonus"] } }, "MappaMare")
  expect(analyzeWeaponComparison(input, db, "MappaMare", 5).weapon.expectedDamage).toBe(evaluateScenario(explicit, db).actionExpectedDamage)
  expect(evaluateScenario(explicit, db).actionExpectedDamage).toBeGreaterThan(evaluateScenario(equip(input, "MappaMare"), db).actionExpectedDamage)
})

it("does not invent another teammate's HP changes for solo Furina", () => {
  const input = scenario("Furina", "furina.skill.salon_solitaire.mademoiselle_crabaletta.single_hit")
  const explicit = equip({ ...input, conditions: { ...input.conditions, activeEffectIds:
    ["weapon.splendor-of-tranquil-waters.self-hp-change.3-stack.skill-damage-bonus"] } }, "SplendorOfTranquilWaters")
  expect(analyzeWeaponComparison(input, db, "SplendorOfTranquilWaters", 5).weapon.expectedDamage).toBe(evaluateScenario(explicit, db).actionExpectedDamage)
})

it.each([
  ["AlleyHunter", "weapon.alley-hunter.off-field.10-stack.damage-bonus"],
  ["RainbowSerpentsRainBow", "weapon.rainbow-serpents-rain-bow.after-off-field-hit.attack-percent"]
])("defaults %s for Oz but not a foreground normal attack", (weaponId, effectId) => {
  const input = scenario("Fischl", "fischl.skill.nightrider.oz.level_one_bolt")
  const explicit = equip({ ...input, conditions: { ...input.conditions, activeEffectIds: [effectId] } }, weaponId)
  const activeDamage = evaluateScenario(explicit, db).actionExpectedDamage
  expect(analyzeWeaponComparison(input, db, weaponId, 5).weapon.expectedDamage).toBe(activeDamage)
  expect(activeDamage).toBeGreaterThan(evaluateScenario(equip(input, weaponId), db).actionExpectedDamage)
  const foreground = { ...input, targetActionId: "fischl.normal.auto.first_hit" }
  expect(analyzeWeaponComparison(foreground, db, weaponId, 5).weapon.expectedDamage).toBe(evaluateScenario(equip(foreground, weaponId), db).actionExpectedDamage)
})

it.each([
  ["Diluc", "diluc.skill.searing_onslaught.first_hit", "TidalShadow", "weapon.tidal-shadow.after-heal.attack-percent"],
  ["Fischl", "fischl.skill.nightrider.oz.level_one_bolt", "SongOfStillness", "weapon.song-of-stillness.after-heal.damage-bonus"]
])("assumes sufficient healing for %s with %s", (characterId, actionId, weaponId, effectId) => {
  const input = equip(scenario(characterId, actionId), weaponId)
  const evaluated = evaluateScenario(input, db)
  expect(evaluated.appliedEffects).toContainEqual(expect.objectContaining({ id: effectId, value: weaponId === "TidalShadow" ? 0.48 : 0.32 }))
  expect(analyzeWeaponComparison(input, db, weaponId, 5).weapon.expectedDamage).toBe(evaluated.actionExpectedDamage)
})

it("preserves full-list and incremental results for the new Jade default", () => {
  const full = evaluateScenarioAnalysis(neuvillette, db, { weaponComparisonRefinements: { SacrificialJade: 2 } })
  expect(analyzeWeaponComparison(neuvillette, db, "SacrificialJade", 2)).toEqual({ baselineExpectedDamage: full.analysis.baselineExpectedDamage,
    weapon: full.analysis.weapons.find((weapon) => weapon.weaponId === "SacrificialJade") })
})
