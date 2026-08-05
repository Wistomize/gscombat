import { describe, expect, it } from "vitest"

import { sandroneCombatCoverage } from "./combat.js"

describe("Sandrone combat content", () => {
  it("keeps the prism branch registered while selecting charged and burst Stellar-Superconduct metrics", () => {
    const action = sandroneCombatCoverage.actions.find(
      (candidate) => candidate.id === "sandrone.skill.phenomenon_calculus.prism_bullet.stellar_superconduct"
    )

    expect(action).toMatchObject({
      damageKind: "special_reaction",
      damageParts: [
        {
          coefficientParameterId: "prism-bullet-stellar-superconduct-damage",
          snapshotChecks: [
            { expectedCoefficient: 0.216, talentLevel: 1 },
            { expectedCoefficient: 0.3888, talentLevel: 10 }
          ]
        }
      ],
      evaluator: "declared_special_reaction",
      parameterReferences: [
        {
          groupId: "skill",
          parameterIndex: 1,
          talentSlot: "skill"
        }
      ],
      scenarioParameters: [
        {
          defaultValue: 0,
          maximumValue: 12,
          minimumValue: 0
        }
      ],
      specialReaction: {
        kind: "stellar_superconduct",
        stellarStoredElementalApplicationsParameterId: "stored-elemental-applications"
      }
    })
    expect(sandroneCombatCoverage.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionId: "sandrone.normal.charged_attack.condensation_ray.stellar_superconduct",
          status: "verified"
        }),
        expect.objectContaining({
          actionId: "sandrone.burst.phenomenon_calculus.negative_temperature_beam.stellar_superconduct",
          status: "verified"
        })
      ])
    )
  })
})
