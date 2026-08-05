import { describe, expect, it } from "vitest"

import { zibaiCombatCoverage } from "./combat.js"

describe("Zibai combat content", () => {
  it("declares the second Lunar-Crystallize burst hit as a selectable standalone action", () => {
    const action = zibaiCombatCoverage.actions.find(
      (candidate) => candidate.id === "zibai.burst.tri_sphere_eminence.second_hit.lunar_crystallize"
    )

    expect(action).toMatchObject({
      damageKind: "special_reaction",
      damageParts: [
        {
          coefficientParameterId: "tri-sphere-eminence-second-hit-lunar-crystallize-damage",
          snapshotChecks: [
            { expectedCoefficient: 1.77744, talentLevel: 1 },
            { expectedCoefficient: 3.199392, talentLevel: 10 }
          ]
        }
      ],
      evaluator: "declared_special_reaction",
      parameterReferences: [
        {
          groupId: "burst",
          parameterIndex: 1,
          talentSlot: "burst"
        }
      ],
      specialReaction: { kind: "lunar_crystallize" }
    })
    expect(zibaiCombatCoverage.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionId: "zibai.skill.spirit_steed_stride.second_hit.lunar_crystallize",
          status: "verified"
        }),
        expect.objectContaining({
          actionId: "zibai.burst.tri_sphere_eminence.second_hit.lunar_crystallize",
          status: "verified"
        })
      ])
    )
  })
})
