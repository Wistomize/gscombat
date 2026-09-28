import { afterAll, expect, it } from "vitest"
import { getCombatActionDefinition, listCombatActionEffects, raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { analyzeWeaponComparison, evaluateScenarioAnalysis } from "../../../src/analysis/analyze.js"
import { evaluateScenario } from "../../../src/scenario/evaluate.js"
import { resolveCombatActionEffects } from "../../../src/effects/action-effects.js"

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

it.each([1, 5])("uses the same prepared Jade bonuses for equipped and candidate builds at R%i", (refinement) => {
  const original = structuredClone(neuvillette)
  const equipped = equip(neuvillette, "SacrificialJade", refinement)
  const automatic = evaluateScenario(equipped, db)
  const active = evaluateScenario({ ...equipped, conditions: { ...equipped.conditions, activeEffectIds: jadeIds } }, db)
  expect(automatic.appliedEffects).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: jadeIds[0], value: refinement === 1 ? 0.32 : 0.64 }),
    expect.objectContaining({ id: jadeIds[1], value: refinement === 1 ? 40 : 80 })
  ]))
  expect(active.actionExpectedDamage).toBe(automatic.actionExpectedDamage)
  expect(analyzeWeaponComparison(equipped, db, "SacrificialJade", refinement).weapon.gainRatio).toBe(0)
  const compared = analyzeWeaponComparison(neuvillette, db, "SacrificialJade", refinement)
  expect(compared.weapon.expectedDamage).toBe(active.actionExpectedDamage)
  expect(compared.baselineExpectedDamage).toBe(evaluateScenario(neuvillette, db).actionExpectedDamage)
  expect(neuvillette).toEqual(original)
  const alreadySelected = { ...equipped, conditions: { ...equipped.conditions, activeEffectIds: jadeIds } }
  expect(analyzeWeaponComparison(alreadySelected, db, "SacrificialJade", refinement).weapon.expectedDamage).toBe(active.actionExpectedDamage)
})

it("defaults Lost Prayer to two foreground stacks while preserving explicit zero", () => {
  const input = equip(neuvillette, "LostPrayerToTheSacredWinds", 1)
  const selected = (stacks: number) => ({ ...input, conditions: { ...input.conditions, activeEffectIds:
    [`weapon.lost-prayer-to-the-sacred-winds.movement.${stacks}-stack.all-element-damage-bonus`] } })
  const automatic = evaluateScenario(input, db)
  expect(automatic.appliedEffects).toContainEqual(expect.objectContaining({
    id: "weapon.lost-prayer-to-the-sacred-winds.movement.2-stack.all-element-damage-bonus", value: 0.16
  }))
  expect(evaluateScenario(selected(2), db).actionExpectedDamage).toBe(automatic.actionExpectedDamage)
  expect(evaluateScenario(selected(0), db).actionExpectedDamage).toBeLessThan(automatic.actionExpectedDamage)
  for (const candidate of [input, selected(0), selected(4)]) {
    expect(analyzeWeaponComparison(candidate, db, "LostPrayerToTheSacredWinds", 1).weapon.gainRatio).toBe(0)
  }
})

it("does not grant Lost Prayer foreground stacks to a background skill, even if explicitly selected", () => {
  const input = equip(neuvillette, "LostPrayerToTheSacredWinds")
  for (const activeEffectIds of [[], ["weapon.lost-prayer-to-the-sacred-winds.movement.4-stack.all-element-damage-bonus"]]) {
    const effects = resolveCombatActionEffects({
      action: getCombatActionDefinition(input.targetActionId)!, primary: input.primary, teammates: [],
      fieldContext: { actionOwnerBuildId: input.primary.buildId, onFieldBuildId: null },
      activeEffectIds, baseEnergyRecharge: 1, enemyCount: 1, gameData: db
    })
    expect(effects.appliedEffects.filter((effect) => effect.id.startsWith("weapon.lost-prayer"))).toEqual([])
  }
})

it("keeps Homa's half-HP choice off by default and applies the same selected conversion to a candidate", () => {
  const input = equip(raidenNationalBuiltinScenario, "StaffOfHoma", 1)
  const selected = { ...input, conditions: { ...input.conditions, activeEffectIds:
    [...input.conditions.activeEffectIds, "weapon.staff-of-homa.hp-below-50.extra-hp-sourced-flat-attack"] } }
  const baseline = evaluateScenario(input, db)
  const halfHp = evaluateScenario(selected, db)
  expect(halfHp.stats.effectiveAttack - baseline.stats.effectiveAttack).toBeCloseTo(halfHp.stats.effectiveHp * 0.01)
  for (const candidate of [input, selected]) {
    expect(analyzeWeaponComparison(candidate, db, "StaffOfHoma", 1).weapon.gainRatio).toBe(0)
  }
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
])("resolves proven HP changes consistently for %s", (characterId, actionId, weaponId, stack) => {
  const input = scenario(characterId, actionId)
  if (characterId === "Furina") input.teammates.push(structuredClone(raidenNationalBuiltinBuild))
  const ids = listCombatActionEffects().filter((effect) => effect.source.kind === "weapon" && effect.source.weaponId === weaponId &&
    effect.weaponChoice?.automaticVariant?.variant === effect.weaponChoice?.variant && effect.id.includes(stack)).map((effect) => effect.id)
  expect(ids.length).toBeGreaterThan(0)
  const explicit = equip({ ...input, conditions: { ...input.conditions, activeEffectIds: ids } }, weaponId, 1)
  expect(analyzeWeaponComparison(input, db, weaponId, 1).weapon.expectedDamage).toBe(evaluateScenario(explicit, db).actionExpectedDamage)
  if (weaponId !== "SplendorOfTranquilWaters") {
    const nonOwner = scenario("YumemizukiMizuki", "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.radiance_stellar_swirl_combo")
    expect(analyzeWeaponComparison(nonOwner, db, weaponId, 1).weapon.expectedDamage).toBe(evaluateScenario(equip(nonOwner, weaponId, 1), db).actionExpectedDamage)
  }
})

it("prepares Mappa only when its wearer can react in the configured team, even for a no-reaction metric", () => {
  const noReaction = equip(neuvillette, "MappaMare")
  expect(analyzeWeaponComparison(neuvillette, db, "MappaMare", 5).weapon.expectedDamage).toBe(evaluateScenario(noReaction, db).actionExpectedDamage)
  const input = scenario("Yanfei", "yanfei.normal.charged_attack.three_scarlet_seals.hydro_aura_vaporize")
  input.teammates.push({ ...structuredClone(raidenNationalBuiltinBuild), buildId: "mappa.hydro", characterId: "Xingqiu",
    weapon: { weaponId: "FavoniusSword", level: 90, ascension: 6, refinement: 1 } })
  const explicit = equip({ ...input, conditions: { ...input.conditions,
    activeEffectIds: ["weapon.mappa-mare.infusion-scroll.2-stack.all-element-damage-bonus"] } }, "MappaMare")
  expect(analyzeWeaponComparison(input, db, "MappaMare", 5).weapon.expectedDamage).toBe(evaluateScenario(explicit, db).actionExpectedDamage)
  expect(evaluateScenario(explicit, db).actionExpectedDamage).toBe(evaluateScenario(equip(input, "MappaMare"), db).actionExpectedDamage)
  expect(evaluateScenario(explicit, db).appliedEffects.some((effect) => effect.id === "weapon.mappa-mare.infusion-scroll.2-stack.all-element-damage-bonus")).toBe(true)
  const unsupported = { ...explicit, teammates: [] }
  expect(evaluateScenario(unsupported, db).appliedEffects.some((effect) => effect.id === "weapon.mappa-mare.infusion-scroll.2-stack.all-element-damage-bonus")).toBe(false)
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
  // Reviewed automatic preparation now applies equally to the actually equipped weapon.
  expect(activeDamage).toBe(evaluateScenario(equip(input, weaponId), db).actionExpectedDamage)
  const foreground = { ...input, targetActionId: "fischl.normal.auto.first_hit" }
  expect(analyzeWeaponComparison(foreground, db, weaponId, 5).weapon.expectedDamage).toBe(evaluateScenario(equip(foreground, weaponId), db).actionExpectedDamage)
})

it.each([
  ["Diluc", "diluc.skill.searing_onslaught.first_hit", "TidalShadow", "weapon.tidal-shadow.after-heal.attack-percent"],
  ["Fischl", "fischl.skill.nightrider.oz.level_one_bolt", "SongOfStillness", "weapon.song-of-stillness.after-heal.damage-bonus"]
])("requires an applicable healing source for %s with %s", (characterId, actionId, weaponId, effectId) => {
  const input = equip(scenario(characterId, actionId), weaponId)
  // The negative case is C0: Fischl C4 is an actual self-healing source and must not be denied.
  input.primary.constellation = 0
  expect(evaluateScenario(input, db).appliedEffects.some((effect) => effect.id === effectId)).toBe(false)
  const selfHealer = { ...structuredClone(neuvillette.primary), buildId: "healing.self-only" }
  expect(evaluateScenario({ ...input, teammates: [selfHealer] }, db).appliedEffects.some((effect) => effect.id === effectId)).toBe(false)
  const healer = { ...structuredClone(neuvillette.primary), buildId: "healing.bennett", characterId: "Bennett",
    weapon: { weaponId: "FavoniusSword", level: 90, ascension: 6, refinement: 1 } }
  const prepared = { ...input, teammates: [healer] }
  const evaluated = evaluateScenario(prepared, db)
  expect(evaluated.appliedEffects).toContainEqual(expect.objectContaining({ id: effectId, value: weaponId === "TidalShadow" ? 0.48 : 0.32 }))
  expect(analyzeWeaponComparison(prepared, db, weaponId, 5).weapon.expectedDamage).toBe(evaluated.actionExpectedDamage)
})

it("preserves full-list and incremental results for the new Jade default", () => {
  const full = evaluateScenarioAnalysis(neuvillette, db, { weaponComparisonRefinements: { SacrificialJade: 2 } })
  expect(analyzeWeaponComparison(neuvillette, db, "SacrificialJade", 2)).toEqual({ baselineExpectedDamage: full.analysis.baselineExpectedDamage,
    weapon: full.analysis.weapons.find((weapon) => weapon.weaponId === "SacrificialJade") })
})
