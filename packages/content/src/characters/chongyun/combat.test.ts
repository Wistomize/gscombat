import { describe, expect, it } from "vitest"

import { chongyunCombatCoverage } from "./combat.js"

describe("Chongyun combat content", () => {
  it("declares the first physical normal hit as an explicitly infusion-eligible event", () => {
    expect(chongyunCombatCoverage.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          element: "physical",
          id: "chongyun.normal.auto.first_hit",
          timeline: expect.objectContaining({
            damageEvents: expect.arrayContaining([
              expect.objectContaining({
                elementalApplication: {
                  activation: "while_element_overridden",
                  icd: { groupId: "chongyun.normal", kind: "standard" }
                },
                elementOverrideTarget: "normal_attack"
              })
            ])
          })
        })
      ])
    )
  })

  it("registers Chonghua's Frost Field as a source-locked Cryo override", () => {
    expect(chongyunCombatCoverage.effects).toEqual([
      expect.objectContaining({
        durationChecks: [
          { expectedCoefficient: 15, talentLevel: 1 },
          { expectedCoefficient: 15, talentLevel: 10 }
        ],
        durationParameter: {
          groupId: "skill",
          id: "frost-field-duration",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        eligibleWeaponTypes: ["sword", "claymore", "polearm"],
        element: "cryo",
        id: "chongyun.skill.chonghuas_frost_field",
        sourceCharacterId: "Chongyun",
        target: "normal_attack"
      })
    ])
  })
})
