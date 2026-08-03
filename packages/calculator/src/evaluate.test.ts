import { describe, expect, it } from "vitest"

import type { ExpectedDamageInput, SingleScalingDamageAction } from "./domain.js"
import { evaluateExpectedDamage } from "./evaluate.js"

const baseAction = {
  canCrit: true,
  multiplier: 2,
  tags: {
    actionId: "raiden.burst.initial_slash",
    element: "electro",
    ownerId: "raiden",
    talent: "burst"
  }
} satisfies SingleScalingDamageAction

const baseInput = {
  action: baseAction,
  enemy: {
    defenseReduction: 0,
    level: 90,
    resistance: 0.1
  },
  modifiers: [],
  stats: {
    attackPercent: 0,
    baseAttack: 1000,
    critDamage: 1,
    critRate: 0.5,
    damageBonus: 0.5,
    elementalMastery: 0,
    flatAttack: 0,
    level: 90
  }
} satisfies ExpectedDamageInput

describe("evaluateExpectedDamage", () => {
  it("evaluates direct damage in typed stage order", () => {
    const result = evaluateExpectedDamage(baseInput)

    expect(result.nonCritDamage).toBeCloseTo(1350)
    expect(result.critDamage).toBeCloseTo(2700)
    expect(result.expectedDamage).toBeCloseTo(2025)
    expect(result.trace.map((entry) => entry.stage)).toEqual([
      "attack",
      "talent",
      "damage_bonus",
      "crit",
      "defense",
      "resistance"
    ])
    expect(result.trace[0]?.formula).toEqual({
      attackPercent: 0,
      baseAttack: 1000,
      flatAttack: 0,
      kind: "attack"
    })
    expect(result.trace[3]?.formula).toEqual({
      critDamage: 1,
      critRate: 0.5,
      kind: "expected_crit",
      multiplier: 1.5
    })
    expect(result.trace[4]?.formula).toMatchObject({
      attackerLevel: 90,
      defenseIgnore: 0,
      defenseReduction: 0,
      enemyLevel: 90,
      kind: "defense"
    })
  })

  it("clamps expected crit rate at one", () => {
    const result = evaluateExpectedDamage({
      ...baseInput,
      stats: {
        ...baseInput.stats,
        critRate: 1.25
      }
    })

    expect(result.expectedDamage).toBeCloseTo(result.critDamage)
  })

  it("uses a guaranteed crit policy independently of the character's crit rate", () => {
    const result = evaluateExpectedDamage({
      ...baseInput,
      action: { ...baseInput.action, critPolicy: "guaranteed" },
      stats: { ...baseInput.stats, critRate: 0 }
    })

    expect(result.expectedDamage).toBeCloseTo(result.critDamage)
    expect(result.trace[3]?.formula).toEqual({
      critDamage: 1,
      critRate: 1,
      kind: "expected_crit",
      multiplier: 2
    })
  })

  it("uses an explicitly declared health scaling stat instead of attack", () => {
    const result = evaluateExpectedDamage({
      ...baseInput,
      action: { ...baseInput.action, scalingStat: "hp" },
      stats: { ...baseInput.stats, hp: 20_000 }
    })

    expect(result.nonCritDamage).toBeCloseTo(27_000)
    expect(result.critDamage).toBeCloseTo(54_000)
    expect(result.expectedDamage).toBeCloseTo(40_500)
    expect(result.trace.map((entry) => entry.stage)).toEqual([
      "scaling",
      "talent",
      "damage_bonus",
      "crit",
      "defense",
      "resistance"
    ])
    expect(result.trace[0]?.formula).toEqual({ kind: "scaling", stat: "hp", value: 20_000 })
  })

  it("uses an explicitly declared elemental-mastery scaling stat instead of attack", () => {
    const result = evaluateExpectedDamage({
      ...baseInput,
      action: { ...baseInput.action, scalingStat: "elementalMastery" },
      stats: { ...baseInput.stats, elementalMastery: 500 }
    })

    expect(result.nonCritDamage).toBeCloseTo(675)
    expect(result.critDamage).toBeCloseTo(1350)
    expect(result.expectedDamage).toBeCloseTo(1012.5)
    expect(result.trace.map((entry) => entry.stage)).toEqual([
      "scaling",
      "talent",
      "damage_bonus",
      "crit",
      "defense",
      "resistance"
    ])
    expect(result.trace[0]?.formula).toEqual({ kind: "scaling", stat: "elementalMastery", value: 500 })
  })

  it("sums mixed attack, health, and elemental-mastery terms before shared damage multipliers", () => {
    const result = evaluateExpectedDamage({
      ...baseInput,
      action: {
        canCrit: true,
        scalingTerms: [
          { coefficient: 2, stat: "attack" },
          { coefficient: 0.1, stat: "hp" },
          { coefficient: 0.5, stat: "elementalMastery" }
        ],
        tags: baseInput.action.tags
      },
      modifiers: [{ kind: "attack_percent", source: "test.attack_percent", value: 0.5 }],
      stats: { ...baseInput.stats, elementalMastery: 300, hp: 20_000 }
    })

    expect(result.nonCritDamage).toBeCloseTo(3476.25)
    expect(result.critDamage).toBeCloseTo(6952.5)
    expect(result.expectedDamage).toBeCloseTo(5214.375)
    expect(result.trace.map((entry) => entry.stage)).toEqual([
      "scaling",
      "damage_bonus",
      "crit",
      "defense",
      "resistance"
    ])
    expect(result.trace[0]?.formula).toEqual({
      kind: "scaling_terms",
      terms: [
        { coefficient: 2, contribution: 3000, stat: "attack", value: 1500 },
        { coefficient: 0.1, contribution: 2000, stat: "hp", value: 20_000 },
        { coefficient: 0.5, contribution: 150, stat: "elementalMastery", value: 300 }
      ]
    })
  })

  it("applies only modifiers matching the action tags", () => {
    const result = evaluateExpectedDamage({
      ...baseInput,
      modifiers: [
        {
          filter: { element: "hydro" },
          kind: "damage_bonus",
          source: "hydro_bonus",
          value: 10
        },
        {
          filter: { talent: "burst" },
          kind: "damage_bonus",
          source: "burst_bonus",
          value: 0.25
        }
      ]
    })

    expect(result.expectedDamage).toBeCloseTo(2362.5)
  })

  it("applies reverse vaporize as an amplifying reaction with an explainable stage", () => {
    const reactionInput = {
      ...baseInput,
      action: {
        ...baseInput.action,
        amplifyingReaction: { bonus: 0, kind: "vaporize_reverse" }
      }
    } as unknown as ExpectedDamageInput

    const result = evaluateExpectedDamage(reactionInput)

    expect(result.expectedDamage).toBeCloseTo(3037.5)
    expect(result.trace.map((entry) => entry.stage)).toEqual([
      "attack",
      "talent",
      "amplifying_reaction",
      "damage_bonus",
      "crit",
      "defense",
      "resistance"
    ])
    expect(result.trace[2]?.formula).toMatchObject({
      bonus: 0,
      kind: "amplifying_reaction",
      multiplier: 1.5,
      reaction: "vaporize_reverse"
    })
  })

  it("adds Spread damage before shared bonus, crit, defense, and resistance stages", () => {
    const reactionInput = {
      ...baseInput,
      action: {
        ...baseInput.action,
        additiveReaction: { bonus: 0, kind: "spread" }
      }
    } as unknown as ExpectedDamageInput

    const result = evaluateExpectedDamage(reactionInput)

    expect(result.expectedDamage).toBeCloseTo(3856.1739609375)
    expect(result.trace.map((entry) => entry.stage)).toEqual([
      "attack",
      "talent",
      "additive_reaction",
      "damage_bonus",
      "crit",
      "defense",
      "resistance"
    ])
    expect(result.trace[2]?.formula).toMatchObject({
      bonus: 0,
      kind: "additive_reaction",
      reaction: "spread",
      reactionDamage: 1808.566875
    })
  })

  it("rejects an action that declares both amplifying and additive reactions", () => {
    const invalidInput = {
      ...baseInput,
      action: {
        ...baseInput.action,
        additiveReaction: { bonus: 0, kind: "spread" },
        amplifyingReaction: { bonus: 0, kind: "vaporize_reverse" }
      }
    } as unknown as ExpectedDamageInput

    expect(() => evaluateExpectedDamage(invalidInput)).toThrow(
      "A direct-damage action cannot declare both amplifying and additive reactions"
    )
  })
})
