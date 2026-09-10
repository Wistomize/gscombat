import {
  getCombatActionDefinition, listActiveCombatActionEffectOptionsForAction,
  raidenNationalBuiltinBuild, raidenNationalBuiltinScenario
} from "@gscombat/content"
import type { EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateScenario } from "../../../src/scenario/evaluate.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
afterAll(() => gameData.close())

function scenario(characterId: string, weaponId: string, targetActionId: string): EvaluationScenario {
  return {
    ...raidenNationalBuiltinScenario,
    primary: {
      ...raidenNationalBuiltinBuild, buildId: `review.${characterId}`, characterId, constellation: 6,
      artifacts: [], talents: { normal: 10, skill: 10, burst: 10 },
      weapon: { weaponId, level: 90, ascension: 6, refinement: 1 }
    },
    teammates: [], externalBuffs: [], targetActionId,
    conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
    enemy: { name: "语义核验木桩", level: 100, resistance: 0.1, defenseReduction: 0 }
  }
}

// Independently reviewed against GO 98aafa1f135f086524b611c7d5b5bfb78d98bb6d:
// Wriothesley charged auto[6]; C1 rebuke is charged damage bonus, not motion value.
describe("reviewed parameter identity and multiplier stages", () => {
  it.each([
    "emilie.constellation.6.marcotte_sillage.lingering_fragrance.normal_attack.first_hit",
    "emilie.constellation.6.marcotte_sillage.lingering_fragrance.charged_attack"
  ])("applies Emilie's Rectification only to an explicitly Burning C6 target: %s", (actionId) => {
    const s = scenario("Emilie", "BeginnersProtector", actionId)
    const effectId = "emilie.passive.rectification.burning_target.damage_bonus"
    expect(listActiveCombatActionEffectOptionsForAction(getCombatActionDefinition(actionId)!))
      .toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
    const plain = evaluateScenario(s, gameData)
    const burningScenario = { ...s, conditions: { ...s.conditions, activeEffectIds: [effectId] } }
    const burning = evaluateScenario(burningScenario, gameData)
    expect(plain.stats.damageBonus).toBe(0)
    expect(burning.stats.damageBonus).toBeCloseTo(Math.min(burning.stats.effectiveAttack * 0.00015, 0.36))
    expect(burning.actionExpectedDamage / plain.actionExpectedDamage).toBeCloseTo(1 + burning.stats.damageBonus)
    const extraAttack = evaluateScenario(burningScenario, gameData, { artifactStatDeltas: { atk: 100 } })
    expect(extraAttack.stats.damageBonus - burning.stats.damageBonus).toBeCloseTo(0.015)
    const capped = evaluateScenario(burningScenario, gameData, { artifactStatDeltas: { atk: 10000 } })
    expect(capped.stats.damageBonus).toBeCloseTo(0.36)
    expect(burning.appliedEffects.filter((effect) => effect.id === effectId)).toHaveLength(1)
    const levelTwo = { ...s, targetActionId: "emilie.skill.extraction_of_lacelight.lumidouce_case.level_two.attack" }
    expect(evaluateScenario({ ...levelTwo, conditions: burningScenario.conditions }, gameData).actionExpectedDamage)
      .toBeCloseTo(evaluateScenario(levelTwo, gameData).actionExpectedDamage)
  })

  it("keeps Wriothesley's C6 fist and icicle on the charged row and additive bonus stage", () => {
    const s = scenario("Wriothesley", "ApprenticesNotes", "wriothesley.normal.rebuke_vaulting_fist.c6_maximum_reachable")
    const fist = evaluateScenario(s, gameData)
    const icicle = evaluateScenario({ ...s, targetActionId: "wriothesley.constellation.6.esteem_for_the_innocent.rebuke_vaulting_fist.icicle" }, gameData)
    const cup = evaluateScenario({ ...s, externalBuffs: [{ sourceId: "test.cup", label: "冰伤杯", stat: "damage_bonus", value: 0.466 }] }, gameData)
    const reference = getCombatActionDefinition(s.targetActionId)?.parameterReferences?.[0]
    expect(reference?.source === "talent" ? reference.parameterIndex : undefined).toBe(6)
    expect(fist.stats.talentMultiplier).toBeCloseTo(3.2504)
    expect(fist.stats.damageBonus).toBeCloseTo(2)
    expect(icicle.actionExpectedDamage).toBeCloseTo(fist.actionExpectedDamage)
    expect(cup.actionExpectedDamage / fist.actionExpectedDamage).toBeCloseTo(3.466 / 3)
    expect(() => evaluateScenario({ ...s, primary: { ...s.primary, constellation: 5 } }, gameData)).toThrow(/requires source constellation 6/)
  })

  it("uses DEF for Xilonen's Nightsoul normal including the C6 additive term", () => {
    const s = scenario("Xilonen", "DullBlade", "xilonen.constellation.6.evernight_blessing.normal_attack.first_hit")
    const base = evaluateScenario(s, gameData)
    const attack = evaluateScenario(s, gameData, { artifactStatDeltas: { atk: 100 } })
    const defense = evaluateScenario(s, gameData, { artifactStatDeltas: { def: 100 } })
    expect(base.stats.talentMultiplier).toBeCloseTo(1.107414)
    expect(attack.actionExpectedDamage).toBeCloseTo(base.actionExpectedDamage)
    expect(defense.actionExpectedDamage).toBeGreaterThan(base.actionExpectedDamage)
    const scaling = base.rotation.events[0]?.trace.find((entry) => entry.kind === "scaling_terms")
    expect(scaling?.kind === "scaling_terms" ? scaling.terms.map((term) => term.stat) : []).toEqual(["defense", "defense"])
  })

  it.each([
    ["Wanderer", "ApprenticesNotes", "wanderer.normal.auto.first_hit", true],
    ["Wriothesley", "ApprenticesNotes", "wriothesley.normal.rebuke_vaulting_fist.c6_maximum_reachable", true],
    ["Xiao", "BeginnersProtector", "xiao.burst.bane_of_all_evil.high_plunge", true],
    ["Xiao", "BeginnersProtector", "xiao.skill.lemniscatic_wind_cycling", false]
  ])("applies Xilonen C4 team flat damage to the appropriate category: %s %s %s", (characterId, weaponId, actionId, eligible) => {
    const support = scenario("Xilonen", "DullBlade", "xilonen.normal.auto.first_hit").primary
    const s = { ...scenario(characterId, weaponId, actionId), teammates: [{ ...support, constellation: 4 }] }
    const base = evaluateScenario(s, gameData)
    const buffed = evaluateScenario({ ...s, conditions: { ...s.conditions, activeEffectIds: ["xilonen.constellation.4.such_a_transfiguration.source_samples.normal_attack.base_damage"] } }, gameData)
    if (eligible) expect(buffed.actionExpectedDamage).toBeGreaterThan(base.actionExpectedDamage)
    else expect(buffed.actionExpectedDamage).toBeCloseTo(base.actionExpectedDamage)
  })

  it.each([
    ["Lyney", "HuntersBow", "lyney.constellation.6.guarded_smile.pyrotechnic_strike.reprised", 14, 4.505],
    ["Xiao", "BeginnersProtector", "xiao.burst.bane_of_all_evil.high_plunge", 12, 4.040179]
  ])("uses the independently reviewed damage row for %s", (characterId, weaponId, actionId, row, coefficient) => {
    const result = evaluateScenario(scenario(characterId, weaponId, actionId), gameData)
    const reference = getCombatActionDefinition(actionId)?.parameterReferences?.[0]
    expect(reference?.source === "talent" ? reference.parameterIndex : undefined).toBe(row)
    expect(result.stats.talentMultiplier).toBeCloseTo(coefficient)
  })

  it("gives Xiao C6 free E its maximum A1/A4 but not the burst's normal/charged/plunge bonus", () => {
    const s = scenario("Xiao", "BeginnersProtector", "xiao.constellation.6.conqueror_of_evil.guardian_yaksha.free_lemniscatic_wind_cycling")
    const result = evaluateScenario(s, gameData)
    expect(result.stats.damageBonus).toBeCloseTo(0.25 + 0.45)
    expect(evaluateScenario({ ...s, primary: { ...s.primary, talents: { ...s.primary.talents, burst: 1 } } }, gameData).actionExpectedDamage).toBeCloseTo(result.actionExpectedDamage)
  })
})
