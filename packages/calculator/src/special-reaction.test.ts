import { describe, expect, it } from "vitest"

import {
  calculateDirectSpecialReactionDamage,
  calculateLunarReactionExpectedDamage,
  getLunarReactionBaseCoefficient,
  getStellarSuperconductBaseCoefficient
} from "./special-reaction.js"

describe("special reaction damage", () => {
  it("uses the independent direct Lunar-Charged stages without ordinary damage bonus or defense", () => {
    const result = calculateDirectSpecialReactionDamage({
      ascensionBonus: 0.2,
      baseDamage: 1000,
      baseDamageBonus: 0.2,
      critDamage: 1,
      critRate: 0.5,
      elementalMastery: 200,
      enemyResistance: 0.1,
      flatDamageAddition: 100,
      kind: "lunar_charged",
      reactionDamageBonus: 0.1,
      resistanceReduction: 0.05
    })

    const afterReactionCoefficient = 1000 * 3
    const afterBaseDamageBonus = afterReactionCoefficient * 1.2
    const afterReactionDamageBonus = afterBaseDamageBonus * (1 + (6 * 200) / (200 + 2000) + 0.1)
    const beforeCrit = afterReactionDamageBonus + 100

    expect(result.nonCritDamage).toBeCloseTo(beforeCrit * 0.95 * 1.2)
    expect(result.critDamage).toBeCloseTo(beforeCrit * 2 * 0.95 * 1.2)
    expect(result.expectedDamage).toBeCloseTo(beforeCrit * 1.5 * 0.95 * 1.2)
    expect(result.trace.map((entry) => entry.stage)).toEqual([
      "base_damage",
      "reaction_coefficient",
      "base_damage_bonus",
      "reaction_damage_bonus",
      "flat_damage_addition",
      "crit",
      "resistance",
      "ascension"
    ])
    expect(result.trace[1]?.formula).toEqual({
      kind: "special_reaction_coefficient",
      multiplier: 3,
      reactionKind: "lunar_charged"
    })
  })

  it("keeps direct Lunar-Bloom as a skill damage type with base coefficient one", () => {
    const result = calculateDirectSpecialReactionDamage({
      baseDamage: 500,
      critDamage: 0,
      critRate: 0,
      elementalMastery: 0,
      enemyResistance: 0.1,
      kind: "lunar_bloom"
    })

    expect(getLunarReactionBaseCoefficient("lunar_bloom")).toBe(1)
    expect(result.reactionCoefficient).toBe(1)
    expect(result.expectedDamage).toBeCloseTo(450)
  })

  it("uses a manual Stellar-Superconduct application snapshot and the documented coefficient cap", () => {
    const result = calculateDirectSpecialReactionDamage({
      baseDamage: 1000,
      critDamage: 0,
      critRate: 0,
      elementalMastery: 0,
      enemyResistance: 0,
      kind: "stellar_superconduct",
      storedElementalApplications: 1
    })

    expect(getStellarSuperconductBaseCoefficient(0)).toBe(1)
    expect(getStellarSuperconductBaseCoefficient(1)).toBeCloseTo(1.45)
    expect(getStellarSuperconductBaseCoefficient(12)).toBe(2)
    expect(getStellarSuperconductBaseCoefficient(14)).toBe(2)
    expect(result.expectedDamage).toBeCloseTo(1450)
    expect(result.trace[1]?.formula).toEqual({
      kind: "special_reaction_coefficient",
      multiplier: 1.45,
      reactionKind: "stellar_superconduct",
      storedElementalApplications: 1
    })
    expect(() => getStellarSuperconductBaseCoefficient(-1)).toThrow("non-negative integer")
    expect(() => getStellarSuperconductBaseCoefficient(1.5)).toThrow("non-negative integer")
  })

  it("applies fixed 60/30/5/5 participant weights to a manual reaction Lunar-Crystallize snapshot", () => {
    const result = calculateLunarReactionExpectedDamage({
      kind: "lunar_crystallize",
      participants: [
        {
          baseDamageBonus: 0.4,
          critDamage: 0,
          critRate: 0,
          elementalMastery: 0,
          enemyResistance: 0,
          participantId: "highest",
          level: 90
        },
        {
          baseDamageBonus: 0.2,
          critDamage: 0,
          critRate: 0,
          elementalMastery: 0,
          enemyResistance: 0,
          participantId: "second",
          level: 90
        },
        {
          critDamage: 0,
          critRate: 0,
          elementalMastery: 0,
          enemyResistance: 0,
          participantId: "third",
          level: 90
        },
        {
          baseDamageBonus: -0.1,
          critDamage: 0,
          critRate: 0,
          elementalMastery: 0,
          enemyResistance: 0,
          participantId: "fourth",
          level: 90
        }
      ]
    })
    const participantDamage = new Map(
      result.participants.map((participant) => [participant.participantId, participant.damage.expectedDamage])
    )
    const expected =
      (participantDamage.get("highest") ?? 0) * 0.6 +
      (participantDamage.get("second") ?? 0) * 0.3 +
      (participantDamage.get("third") ?? 0) * 0.05 +
      (participantDamage.get("fourth") ?? 0) * 0.05

    expect(result.outcomes).toHaveLength(16)
    expect(result.expectedDamage).toBeCloseTo(expected)
    expect(result.outcomes[0]?.rankedParticipantIds).toEqual(["highest", "second", "third", "fourth"])
  })

  it("ranks each concrete critical outcome before calculating reaction Moon expectation", () => {
    const result = calculateLunarReactionExpectedDamage({
      kind: "lunar_charged",
      participants: [
        {
          critDamage: 1,
          critRate: 0.5,
          elementalMastery: 0,
          enemyResistance: 0,
          participantId: "A",
          level: 90
        },
        {
          baseDamageBonus: 0.5,
          critDamage: 1,
          critRate: 0.5,
          elementalMastery: 0,
          enemyResistance: 0,
          participantId: "B",
          level: 90
        }
      ]
    })
    const participantById = new Map(result.participants.map((participant) => [participant.participantId, participant]))
    const a = participantById.get("A")?.damage
    const b = participantById.get("B")?.damage
    if (!a || !b) throw new Error("Expected both manual Lunar-Charged participants")

    const expected =
      (0.6 * b.nonCritDamage + 0.3 * a.nonCritDamage +
        0.6 * a.critDamage +
        0.3 * b.nonCritDamage +
        0.6 * b.critDamage +
        0.3 * a.nonCritDamage +
        0.6 * b.critDamage +
        0.3 * a.critDamage) /
      4
    const incorrectlyRankedExpectedDamage = 0.6 * b.expectedDamage + 0.3 * a.expectedDamage

    expect(result.outcomes).toHaveLength(4)
    expect(result.expectedDamage).toBeCloseTo(expected)
    expect(result.expectedDamage).not.toBeCloseTo(incorrectlyRankedExpectedDamage, 8)
    expect(result.outcomes.find((outcome) => outcome.criticalParticipantIds.join(",") === "A")?.rankedParticipantIds).toEqual([
      "A",
      "B"
    ])
  })

  it("requires one through four manual participant records and rejects Lunar-Bloom reaction aggregation", () => {
    expect(() =>
      calculateLunarReactionExpectedDamage({
        kind: "lunar_charged",
        participants: []
      })
    ).toThrow("between one and four manual participants")
    expect(() =>
      calculateLunarReactionExpectedDamage({
        kind: "lunar_bloom" as never,
        participants: []
      })
    ).toThrow("Only Lunar-Charged and Lunar-Crystallize")
  })
})
