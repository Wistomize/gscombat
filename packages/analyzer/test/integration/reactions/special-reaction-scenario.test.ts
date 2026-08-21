import { getCombatActionDefinition, raidenNationalBuiltinBuild, type CombatActionMetadata } from "@gscombat/content"
import type { ExternalBuff } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredSpecialReactionScenarioAction } from "../../../src/evaluators/declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const

afterAll(() => gameData.close())

function requireAction(actionId: string): CombatActionMetadata {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createSpecialAction(
  id: string,
  specialReaction: NonNullable<CombatActionMetadata["specialReaction"]>,
  scenarioParameters?: CombatActionMetadata["scenarioParameters"]
): CombatActionMetadata {
  const source = requireAction("raiden.skill.transcendence_baleful_omen.initial_hit")
  return {
    ...source,
    damageKind: "special_reaction",
    evaluator: "declared_special_reaction",
    id,
    ...(scenarioParameters === undefined ? {} : { scenarioParameters }),
    specialReaction
  }
}

describe("declared special-reaction scenario actions", () => {
  it("routes a direct Lunar-Charged action through the independent formula without ordinary damage bonus or defense", () => {
    const action = createSpecialAction("test.lunar-charged.direct", {
      ascensionBonus: 0.15,
      baseDamageBonus: 0.1,
      flatDamageAddition: 50,
      kind: "lunar_charged",
      reactionDamageBonus: 0.2
    })
    const ordinaryDamageBonus: ExternalBuff = {
      label: "测试普通伤害加成",
      sourceId: "test.ordinary-damage-bonus",
      stat: "damage_bonus",
      value: 1
    }
    const elementalMastery: ExternalBuff = {
      label: "测试元素精通",
      sourceId: "test.elemental-mastery",
      stat: "elemental_mastery",
      value: 200
    }
    const baseline = evaluateDeclaredSpecialReactionScenarioAction({
      action,
      build: raidenNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })
    const withOrdinaryDamageBonus = evaluateDeclaredSpecialReactionScenarioAction({
      action,
      build: raidenNationalBuiltinBuild,
      buffs: [ordinaryDamageBonus],
      enemy,
      gameData
    })
    const withElementalMastery = evaluateDeclaredSpecialReactionScenarioAction({
      action,
      build: raidenNationalBuiltinBuild,
      buffs: [elementalMastery],
      enemy,
      gameData
    })

    expect(baseline.result.kind).toBe("lunar_charged")
    expect(baseline.result.reactionCoefficient).toBe(3)
    expect(baseline.rotation).toMatchObject({
      dpr: baseline.result.expectedDamage,
      dps: baseline.result.expectedDamage,
      duration: 1
    })
    expect(baseline.rotation.events).toHaveLength(1)
    expect(baseline.rotation.events[0]?.trace.map((entry) => entry.kind)).toEqual(
      Array(9).fill("special_reaction")
    )
    expect(baseline.result.trace.map((entry) => entry.stage)).toEqual([
      "base_damage",
      "reaction_coefficient",
      "base_damage_multiplier",
      "base_damage_bonus",
      "reaction_damage_bonus",
      "flat_damage_addition",
      "crit",
      "resistance",
      "ascension"
    ])
    expect(baseline.result.trace[1]?.formula).toEqual({
      kind: "special_reaction_coefficient",
      multiplier: 3,
      reactionKind: "lunar_charged"
    })
    expect(withOrdinaryDamageBonus.stats.damageBonus).toBeCloseTo(baseline.stats.damageBonus + 1)
    expect(withOrdinaryDamageBonus.result.expectedDamage).toBeCloseTo(baseline.result.expectedDamage)
    expect(withElementalMastery.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
  })

  it("uses the declared manual Stellar-Superconduct snapshot rather than inferring a rotation", () => {
    const action = createSpecialAction(
      "test.stellar-superconduct.direct",
      {
        kind: "stellar_superconduct",
        stellarStoredElementalApplicationsParameterId: "stored-elemental-applications"
      },
      [
        {
          defaultValue: 0,
          id: "stored-elemental-applications",
          label: "极星辉域已储存元素附着次数",
          maximumValue: 12,
          minimumValue: 0
        }
      ]
    )
    const withoutStoredApplications = evaluateDeclaredSpecialReactionScenarioAction({
      action,
      build: raidenNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })
    const withTwelveStoredApplications = evaluateDeclaredSpecialReactionScenarioAction({
      action,
      actionParameters: { "stored-elemental-applications": 12 },
      build: raidenNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })

    expect(withoutStoredApplications.stats.actionParameters).toEqual({ "stored-elemental-applications": 0 })
    expect(withoutStoredApplications.result.reactionCoefficient).toBe(1)
    expect(withTwelveStoredApplications.result.reactionCoefficient).toBe(2)
    expect(withTwelveStoredApplications.result.expectedDamage).toBeCloseTo(
      withoutStoredApplications.result.expectedDamage * 2
    )
    expect(withTwelveStoredApplications.result.trace[1]?.formula).toEqual({
      kind: "special_reaction_coefficient",
      multiplier: 2,
      reactionKind: "stellar_superconduct",
      storedElementalApplications: 12
    })
  })

  it("routes a direct Stellar-Swirl action through the shared base-damage multiplier stage", () => {
    const baselineAction = createSpecialAction("test.stellar-swirl.direct.baseline", { kind: "stellar_swirl" })
    const enhancedAction = createSpecialAction("test.stellar-swirl.direct.enhanced", {
      baseDamageMultiplier: 0.3,
      kind: "stellar_swirl"
    })
    const baseline = evaluateDeclaredSpecialReactionScenarioAction({
      action: baselineAction,
      build: raidenNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })
    const enhanced = evaluateDeclaredSpecialReactionScenarioAction({
      action: enhancedAction,
      build: raidenNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })

    expect(enhanced.result.kind).toBe("stellar_swirl")
    expect(enhanced.result.reactionCoefficient).toBe(1)
    expect(enhanced.result.expectedDamage).toBeCloseTo(baseline.result.expectedDamage * 1.3)
    expect(enhanced.result.trace[2]).toMatchObject({
      formula: {
        bonus: 0.3,
        kind: "special_reaction_base_damage_multiplier",
        multiplier: 1.3
      },
      stage: "base_damage_multiplier"
    })
  })
})
