import { Value } from "typebox/value"
import { describe, expect, it } from "vitest"

import { CombatActionMetadataSchema, CombatElementOverrideEffectSchema } from "./combat-coverage.js"

const actionWithTimeline = {
  characterId: "Xingqiu",
  damageKind: "direct",
  damageParts: [
    { coefficientParameterId: "first-hit-multiplier", id: "first-hit" },
    { coefficientParameterId: "second-hit-multiplier", id: "second-hit" }
  ],
  element: "hydro",
  evaluator: "declared_direct",
  id: "xingqiu.skill.fatal-rainscreen",
  kind: "damage",
  scalingStat: "attack",
  status: "verified",
  talentSlot: "skill",
  timeline: {
    damageEvents: [
      { at: 0, damagePartId: "first-hit", id: "first-hit", snapshot: "cast" },
      { at: 0.35, damagePartId: "second-hit", id: "second-hit", snapshot: "hit" }
    ],
    duration: 0.7
  }
}

describe("CombatActionMetadataSchema", () => {
  it("serializes a fixed-level passive parameter reference for a support action", () => {
    expect(
      Value.Check(CombatActionMetadataSchema, {
        characterId: "TestSupport",
        element: "anemo",
        id: "test_support.passive.support_output",
        kind: "support",
        parameterReferences: [
          {
            groupId: "passive2",
            id: "fixed-passive-output",
            parameterIndex: 0,
            source: "talent",
            talentSlot: "passive"
          }
        ],
        status: "verified",
        talentSlot: "passive"
      })
    ).toBe(true)
  })

  it("serializes an explicit ordered damage-event timeline", () => {
    expect(Value.Check(CombatActionMetadataSchema, actionWithTimeline)).toBe(true)
  })

  it("serializes a direct Stellar-Superconduct action with an explicit manual snapshot", () => {
    expect(
      Value.Check(CombatActionMetadataSchema, {
        characterId: "Sandrone",
        damageKind: "special_reaction",
        damageParts: [{ coefficientParameterId: "prism-bullet-damage", id: "prism-bullet" }],
        element: "cryo",
        evaluator: "declared_special_reaction",
        id: "sandrone.skill.prism_bullet.stellar_superconduct",
        kind: "damage",
        scalingStat: "attack",
        scenarioParameters: [
          {
            defaultValue: 0,
            id: "stored-elemental-applications",
            label: "极星辉域已储存元素附着次数",
            maximumValue: 12,
            minimumValue: 0
          }
        ],
        specialReaction: {
          kind: "stellar_superconduct",
          stellarStoredElementalApplicationsParameterId: "stored-elemental-applications"
        },
        status: "verified",
        talentSlot: "skill"
      })
    ).toBe(true)
  })

  it("serializes bounded manual snapshot parameters for hit counts and coefficient lookups", () => {
    expect(
      Value.Check(CombatActionMetadataSchema, {
        ...actionWithTimeline,
        scenarioParameters: [
          {
            allowedValues: [1, 3],
            defaultValue: 3,
            id: "hit-count",
            label: "命中次数",
            maximumValue: 3,
            minimumValue: 1
          }
        ],
        timeline: {
          duration: 1,
          damageEvents: [
            {
              at: 0,
              coefficientMultiplier: {
                kind: "scenario_parameter_lookup",
                parameterId: "hit-count",
                values: [
                  { multiplier: 1, parameterValue: 1 },
                  { multiplier: 1.2, parameterValue: 3 }
                ]
              },
              damagePartId: "first-hit",
              hitCount: { kind: "scenario_parameter", parameterId: "hit-count" },
              id: "parameterized-hit",
              snapshot: "cast"
            }
          ]
        }
      })
    ).toBe(true)
  })

  it("serializes affine intrinsic multipliers and capped source-stat conversions", () => {
    expect(
      Value.Check(CombatActionMetadataSchema, {
        ...actionWithTimeline,
        intrinsicEffects: [
          {
            fixedValue: 0.002,
            kind: "flat",
            scenarioParameterMultiplier: {
              base: 0,
              parameterId: "fighting-spirit",
              perParameterValue: 1
            },
            target: "damageBonus"
          },
          {
            coefficientParameterId: "mastery-damage-bonus",
            kind: "source_stat",
            maximumValue: 0.15,
            sourceStat: "elementalMastery",
            target: "damageBonus"
          }
        ],
        scenarioParameters: [
          {
            defaultValue: 200,
            id: "fighting-spirit",
            label: "战意",
            maximumValue: 200,
            minimumValue: 100
          }
        ]
      })
    ).toBe(true)
  })

  it("serializes one snapshot-scaled damage term and a talent-linear event multiplier", () => {
    expect(
      Value.Check(CombatActionMetadataSchema, {
        ...actionWithTimeline,
        damageParts: [
          {
            id: "snapshot-scaled-hit",
            scalingTerms: [
              { coefficientParameterId: "attack-coefficient", stat: "attack" },
              {
                coefficientMultiplierScenarioParameterId: "stored-stacks",
                coefficientParameterId: "hp-coefficient-per-stack",
                stat: "hp"
              }
            ]
          }
        ],
        scenarioParameters: [
          {
            allowedValues: [0, 2, 4],
            defaultValue: 4,
            id: "stored-stacks",
            label: "当前层数",
            maximumValue: 4,
            minimumValue: 0
          }
        ],
        timeline: {
          duration: 1,
          damageEvents: [
            {
              at: 0,
              coefficientMultiplier: {
                base: 1,
                kind: "scenario_parameter_talent_linear",
                parameterId: "stored-stacks",
                perParameterTalentCoefficientId: "per-stack-damage-increase"
              },
              damagePartId: "snapshot-scaled-hit",
              id: "snapshot-scaled-hit",
              snapshot: "cast"
            }
          ]
        }
      })
    ).toBe(true)
  })

  it("accepts elemental mastery as a direct-damage scaling stat", () => {
    expect(
      Value.Check(CombatActionMetadataSchema, {
        ...actionWithTimeline,
        scalingStat: "elementalMastery"
      })
    ).toBe(true)
  })

  it("accepts elemental mastery in an explicitly declared mixed damage part", () => {
    expect(
      Value.Check(CombatActionMetadataSchema, {
        ...actionWithTimeline,
        damageParts: [
          {
            id: "mixed-hit",
            scalingTerms: [
              { coefficientParameterId: "attack-coefficient", stat: "attack" },
              { coefficientParameterId: "mastery-coefficient", stat: "elementalMastery" }
            ]
          }
        ],
        timeline: {
          ...actionWithTimeline.timeline,
          damageEvents: [{ at: 0, damagePartId: "mixed-hit", id: "mixed-hit", snapshot: "cast" }]
        }
      })
    ).toBe(true)
  })

  it("requires a non-negative numeric snapshotAt for an explicit time snapshot", () => {
    const timedEvent = {
      at: 0.35,
      damagePartId: "second-hit",
      id: "second-hit",
      snapshot: "time",
      snapshotAt: 0.2
    }
    expect(
      Value.Check(CombatActionMetadataSchema, {
        ...actionWithTimeline,
        timeline: { ...actionWithTimeline.timeline, damageEvents: [timedEvent] }
      })
    ).toBe(true)
    expect(
      Value.Check(CombatActionMetadataSchema, {
        ...actionWithTimeline,
        timeline: {
          ...actionWithTimeline.timeline,
          damageEvents: [{ ...timedEvent, snapshotAt: undefined }]
        }
      })
    ).toBe(false)
    expect(
      Value.Check(CombatActionMetadataSchema, {
        ...actionWithTimeline,
        timeline: { ...actionWithTimeline.timeline, damageEvents: [{ ...timedEvent, snapshotAt: -0.01 }] }
      })
    ).toBe(false)
    expect(
      Value.Check(CombatActionMetadataSchema, {
        ...actionWithTimeline,
        timeline: { ...actionWithTimeline.timeline, damageEvents: [{ ...timedEvent, snapshotAt: "0.2" }] }
      })
    ).toBe(false)
  })

  it("rejects non-positive action durations and unsupported snapshot policies", () => {
    expect(
      Value.Check(CombatActionMetadataSchema, {
        ...actionWithTimeline,
        timeline: { ...actionWithTimeline.timeline, duration: 0 }
      })
    ).toBe(false)
    expect(
      Value.Check(CombatActionMetadataSchema, {
        ...actionWithTimeline,
        timeline: {
          ...actionWithTimeline.timeline,
          damageEvents: [{ ...actionWithTimeline.timeline.damageEvents[0], snapshot: "dynamic" }]
        }
      })
    ).toBe(false)
  })

  it("requires a non-empty ICD group when a timeline event declares standard elemental application", () => {
    expect(
      Value.Check(CombatActionMetadataSchema, {
        ...actionWithTimeline,
        timeline: {
          ...actionWithTimeline.timeline,
          damageEvents: [
            {
              ...actionWithTimeline.timeline.damageEvents[0],
              elementalApplication: { icd: { groupId: "", kind: "standard" } }
            }
          ]
        }
      })
    ).toBe(false)
  })

  it("requires an elemental-application reaction bonus to be numeric", () => {
    expect(
      Value.Check(CombatActionMetadataSchema, {
        ...actionWithTimeline,
        timeline: {
          ...actionWithTimeline.timeline,
          damageEvents: [
            {
              ...actionWithTimeline.timeline.damageEvents[0],
              elementalApplication: { icd: { kind: "none" }, reactionBonus: "not-a-number" }
            }
          ]
        }
      })
    ).toBe(false)
  })
})

describe("CombatElementOverrideEffectSchema", () => {
  it("serializes a source-locked Cryo normal-attack override effect", () => {
    expect(
      Value.Check(CombatElementOverrideEffectSchema, {
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
        label: "灵刃·重华叠霜 / 领域附魔",
        sourceCharacterId: "Chongyun",
        target: "normal_attack"
      })
    ).toBe(true)
  })

  it("rejects a Physical element or a non-melee target weapon", () => {
    const effect = {
      durationChecks: [{ expectedCoefficient: 15, talentLevel: 1 }],
      durationParameter: {
        groupId: "skill",
        id: "frost-field-duration",
        parameterIndex: 2,
        source: "talent",
        talentSlot: "skill"
      },
      eligibleWeaponTypes: ["sword"],
      element: "cryo",
      id: "test.effect",
      label: "测试效果",
      sourceCharacterId: "Chongyun",
      target: "normal_attack"
    }
    expect(Value.Check(CombatElementOverrideEffectSchema, { ...effect, element: "physical" })).toBe(false)
    expect(Value.Check(CombatElementOverrideEffectSchema, { ...effect, eligibleWeaponTypes: ["bow"] })).toBe(false)
  })
})
