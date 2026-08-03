import { describe, expect, it } from "vitest"

import { sandroneCombatCoverage } from "./combat.js"

describe("Sandrone combat content", () => {
  it("declares the Stellar-Superconduct prism branch as a selectable manual-snapshot action", () => {
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
          actionId: "sandrone.skill.phenomenon_calculus.prism_bullet.stellar_superconduct",
          label: expect.stringContaining("非完整循环"),
          status: "verified"
        })
      ])
    )
  })
})
