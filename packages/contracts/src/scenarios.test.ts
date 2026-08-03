import { Value } from "typebox/value"
import { describe, expect, it } from "vitest"

import {
  MetricEvaluationContextSchema,
  MetricFriendlyRecipientContextSchema,
  MetricSourceContextSchema,
  ScenarioConditionsSchema
} from "./scenarios.js"

const baseConditions = {
  activeEffectIds: [],
  enemyCount: 1
}

describe("ScenarioConditionsSchema", () => {
  it("accepts explicit target aura windows for event-level reaction evaluation", () => {
    expect(
      Value.Check(ScenarioConditionsSchema, {
        ...baseConditions,
        targetAuraWindows: [{ element: "hydro", end: 1, id: "target.hydro", start: 0 }]
      })
    ).toBe(true)
  })

  it("accepts integer action state while rejecting non-integer values", () => {
    expect(
      Value.Check(ScenarioConditionsSchema, {
        ...baseConditions,
        actionParameters: { "rosula-shard-hit-count": 11 }
      })
    ).toBe(true)
    expect(
      Value.Check(ScenarioConditionsSchema, {
        ...baseConditions,
        actionParameters: { "rosula-shard-hit-count": 10.5 }
      })
    ).toBe(false)
  })

  it("rejects the removed Raiden-only global snapshot field", () => {
    expect(Value.Check(ScenarioConditionsSchema, { ...baseConditions, raidenResolveStacks: 60 })).toBe(false)
  })

  it("rejects an unsupported target aura element", () => {
    expect(
      Value.Check(ScenarioConditionsSchema, {
        ...baseConditions,
        targetAuraWindows: [{ element: "physical", end: 1, id: "target.physical", start: 0 }]
      })
    ).toBe(false)
  })

  it("rejects caller-supplied elemental override windows", () => {
    expect(
      Value.Check(ScenarioConditionsSchema, {
        ...baseConditions,
        elementOverrideWindows: [
          { element: "pyro", end: 0.8, id: "bennett.c6", start: 0.2, target: "normal_attack" }
        ]
      })
    ).toBe(false)
  })

  it("rejects a duplicate active effect selection", () => {
    expect(
      Value.Check(ScenarioConditionsSchema, {
        ...baseConditions,
        activeEffectIds: ["chongyun.skill.chonghuas_frost_field", "chongyun.skill.chonghuas_frost_field"]
      })
    ).toBe(false)
  })
})

describe("MetricEvaluationContextSchema", () => {
  it("accepts a selected recipient state without pretending it is a damage scenario", () => {
    expect(
      Value.Check(MetricEvaluationContextSchema, {
        activeEffectIds: ["artifact.maiden-beloved.4pc.after-skill-or-burst.party-incoming-healing-bonus"],
        activeEffectSourceBuildIds: {
          "artifact.maiden-beloved.4pc.after-skill-or-burst.party-incoming-healing-bonus": "test.maiden-holder"
        },
        actionParameters: { "fanfare-points": 300 },
        source: { currentHpFraction: 0.5 },
        recipient: {
          buildId: "builtin.raiden-national.raiden",
          currentHpFraction: 0.5,
          incomingHealingBonus: 0.2,
          isMoonsign: true,
          isWithinSourceArea: true,
          missingHp: 12_000
        },
        teammates: []
      })
    ).toBe(true)
  })

  it("accepts only an explicit boolean Moonsign state for routed support metrics", () => {
    expect(
      Value.Check(MetricFriendlyRecipientContextSchema, {
        buildId: "test.target",
        isMoonsign: false
      })
    ).toBe(true)
    expect(
      Value.Check(MetricFriendlyRecipientContextSchema, {
        buildId: "test.target",
        isMoonsign: 1
      })
    ).toBe(false)
  })

  it("accepts an explicit source health state only for source-owned metric conditions", () => {
    expect(Value.Check(MetricSourceContextSchema, { currentHpFraction: 0.5 })).toBe(true)
    expect(Value.Check(MetricSourceContextSchema, { currentHpFraction: -0.1 })).toBe(false)
    expect(Value.Check(MetricSourceContextSchema, { currentHpFraction: 1.1 })).toBe(false)
  })

  it("accepts a whole-number source enemy count without turning a support metric into a damage scenario", () => {
    expect(Value.Check(MetricSourceContextSchema, { enemyCount: 2 })).toBe(true)
    expect(Value.Check(MetricSourceContextSchema, { enemyCount: 1.5 })).toBe(false)
    expect(Value.Check(MetricSourceContextSchema, { enemyCount: 0 })).toBe(false)
  })

  it("rejects impossible recipient health fractions and unknown metric context fields", () => {
    expect(
      Value.Check(MetricFriendlyRecipientContextSchema, {
        buildId: "test.target",
        currentHpFraction: 1.1
      })
    ).toBe(false)
    expect(
      Value.Check(MetricFriendlyRecipientContextSchema, {
        buildId: "test.target",
        currentHpFraction: 0.5,
        missingHp: -1
      })
    ).toBe(false)
    expect(
      Value.Check(MetricEvaluationContextSchema, {
        recipient: { buildId: "test.target" },
        targetActionId: "raiden.burst.initial_slash"
      })
    ).toBe(false)
  })
})
