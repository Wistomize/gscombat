import { describe, expect, it } from "vitest"

import type { ExpectedDamageInput } from "./domain.js"
import { evaluateExpectedDamage } from "./evaluate.js"

const baseInput: ExpectedDamageInput = {
  action: {
    canCrit: true,
    multiplier: 2,
    tags: {
      actionId: "raiden.burst.initial_slash",
      element: "electro",
      ownerId: "raiden",
      talent: "burst"
    }
  },
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
    flatAttack: 0,
    level: 90
  }
}

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
})
