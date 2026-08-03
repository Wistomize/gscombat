import {
  getCharacterCombatDefinition,
  reviewedMultiScalingEvidenceRegistry,
  type CharacterCombatCoverage,
  type CombatActionMetadata,
  type CombatMetricDefinition,
  type ReviewedMultiScalingEvidenceRecord,
  type SingleScalingCombatDamagePart
} from "@gscombat/content"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import {
  assertCombatRegistryIntegrity,
  validateCombatRegistryIntegrity
} from "./combat-registry-integrity.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(() => gameData.close())

function requireCoverage(characterId: string): CharacterCombatCoverage {
  const coverage = getCharacterCombatDefinition(characterId)
  if (!coverage) throw new Error(`Expected ${characterId} to be present in the combat registry`)
  return coverage
}

function requireAction(coverage: CharacterCombatCoverage): CombatActionMetadata {
  const action = coverage.actions[0]
  if (!action) throw new Error(`Expected ${coverage.characterId} to declare one combat action`)
  return action
}

function createCoverage(
  characterId: string,
  actions: readonly CombatActionMetadata[],
  metrics: readonly CombatMetricDefinition[] = []
): CharacterCombatCoverage {
  return {
    actions,
    characterId,
    detail: "Integrity-test declaration",
    label: characterId,
    metrics,
    status: "draft"
  }
}

function createAnemoTravelerAction(
  overrides: Partial<CombatActionMetadata> = {}
): CombatActionMetadata {
  return {
    characterId: "Traveler",
    damageKind: "direct",
    damageParts: [{ coefficientParameterId: "gender-specific-normal-hit", id: "gender-specific-normal-hit" }],
    element: "anemo",
    evaluator: "declared_direct",
    id: "test.traveler.anemo.gender-specific-normal",
    kind: "damage",
    parameterReferences: [
      {
        groupId: "auto",
        id: "gender-specific-normal-hit",
        parameterIndex: 6,
        source: "talent",
        talentSlot: "normal"
      }
    ],
    scalingStat: "attack",
    status: "verified",
    talentSlot: "normal",
    travelerElement: "anemo",
    ...overrides
  }
}

describe("combat registry integrity", () => {
  it("rejects invalid or duplicate character-owned talent-level constellation mappings", () => {
    const huTao = requireCoverage("HuTao")
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        {
          ...huTao,
          talentLevelConstellationBonuses: [
            { minimumSourceConstellation: 7, talentSlot: "skill", value: 3 },
            { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
            { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 }
          ]
        }
      ]
    })

    expect(report.issues.map((issue) => issue.code)).toEqual([
      "invalid-character-talent-level-constellation-bonus",
      "duplicate-character-talent-level-constellation-bonus"
    ])
  })

  it("publishes reviewed Dehya multi-scaling evidence against the pinned source", () => {
    const evidence = reviewedMultiScalingEvidenceRegistry.records.find(
      (record) => record.actionId === "dehya.burst.flame_manes_fist"
    )

    expect(evidence).toMatchObject({
      actionId: "dehya.burst.flame_manes_fist",
      damagePartId: "flame-manes-fist",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Dehya/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073"
      },
      terms: [
        {
          coefficientParameterId: "flame-manes-fist-attack",
          groupId: "burst",
          parameterIndex: 0,
          snapshotChecks: [
            { expectedCoefficient: 0.987, talentLevel: 1 },
            { expectedCoefficient: 1.7766, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "fistDmgAtk",
          talentSlot: "burst"
        },
        {
          coefficientParameterId: "flame-manes-fist-hp",
          groupId: "burst",
          parameterIndex: 1,
          snapshotChecks: [
            { expectedCoefficient: 0.01692, talentLevel: 1 },
            { expectedCoefficient: 0.030456, talentLevel: 10 }
          ],
          stat: "hp",
          symbol: "fistDmgHp",
          talentSlot: "burst"
        }
      ]
    })
  })

  it("publishes reviewed Nefer multi-scaling evidence against the pinned source", () => {
    const evidence = reviewedMultiScalingEvidenceRegistry.records.find(
      (record) => record.actionId === "nefer.skill.senet_strategy.dance_of_a_thousand_nights.initial_hit"
    )

    expect(evidence).toMatchObject({
      actionId: "nefer.skill.senet_strategy.dance_of_a_thousand_nights.initial_hit",
      damagePartId: "dance-of-a-thousand-nights-initial-hit",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Nefer/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientParameterId: "dance-of-a-thousand-nights-attack",
          explanation: expect.stringContaining("skillDmgAtk"),
          groupId: "skill",
          parameterIndex: 0,
          snapshotChecks: [
            { expectedCoefficient: 0.76384, talentLevel: 1 },
            { expectedCoefficient: 1.374912, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "skillDmgAtk",
          talentSlot: "skill"
        },
        {
          coefficientParameterId: "dance-of-a-thousand-nights-elemental-mastery",
          explanation: expect.stringContaining("skillDmgEleMas"),
          groupId: "skill",
          parameterIndex: 1,
          snapshotChecks: [
            { expectedCoefficient: 1.52768, talentLevel: 1 },
            { expectedCoefficient: 2.749824, talentLevel: 10 }
          ],
          stat: "elementalMastery",
          symbol: "skillDmgEleMas",
          talentSlot: "skill"
        }
      ]
    })
  })

  it("requires reviewed evidence for every verified multi-scaling damage part", () => {
    const dehya = requireCoverage("Dehya")
    const action = requireAction(dehya)
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [createCoverage("Dehya", [action])],
      reviewedMultiScalingEvidence: []
    })

    expect(report.issues.map((issue) => issue.code)).toEqual(["missing-reviewed-multi-scaling-evidence"])
  })

  it("requires reviewed evidence to match every verified multi-scaling term pair exactly", () => {
    const dehya = requireCoverage("Dehya")
    const action = requireAction(dehya)
    const evidence = reviewedMultiScalingEvidenceRegistry.records.find(
      (record) => record.actionId === action.id && record.damagePartId === "flame-manes-fist"
    )
    if (!evidence) throw new Error("Expected reviewed evidence for Dehya's Flame-Mane's Fist")
    const firstTerm = evidence.terms[0]
    const secondTerm = evidence.terms[1]
    if (!firstTerm || !secondTerm) throw new Error("Expected two reviewed terms for Dehya's Flame-Mane's Fist")

    const mismatchedEvidenceSets: readonly (readonly ReviewedMultiScalingEvidenceRecord[])[] = [
      [
        {
          ...evidence,
          terms: [firstTerm, { ...secondTerm, stat: "defense" }]
        }
      ],
      [
        {
          ...evidence,
          terms: [{ ...firstTerm, coefficientParameterId: "wrong-parameter-id" }, secondTerm]
        }
      ],
      [
        {
          ...evidence,
          terms: [firstTerm]
        } as unknown as ReviewedMultiScalingEvidenceRecord
      ],
      [
        {
          ...evidence,
          terms: [firstTerm, secondTerm, secondTerm]
        }
      ]
    ]

    for (const reviewedMultiScalingEvidence of mismatchedEvidenceSets) {
      const report = validateCombatRegistryIntegrity({
        gameData,
        registry: [createCoverage("Dehya", [action])],
        reviewedMultiScalingEvidence
      })

      expect(report.issues.map((issue) => issue.code)).toEqual(["reviewed-multi-scaling-evidence-term-mismatch"])
    }
  })

  it("requires every reviewed multi-scaling source path and snapshot check to match its action term", () => {
    const dehya = requireCoverage("Dehya")
    const action = requireAction(dehya)
    const evidence = reviewedMultiScalingEvidenceRegistry.records.find(
      (record) => record.actionId === action.id && record.damagePartId === "flame-manes-fist"
    )
    if (!evidence) throw new Error("Expected reviewed evidence for Dehya's Flame-Mane's Fist")
    const firstTerm = evidence.terms[0]
    const secondTerm = evidence.terms[1]
    const secondSnapshotCheck = firstTerm?.snapshotChecks[1]
    if (!firstTerm || !secondTerm || !secondSnapshotCheck) {
      throw new Error("Expected two reviewed terms and snapshots for Dehya's Flame-Mane's Fist")
    }

    const mismatchedEvidenceSets: readonly (readonly ReviewedMultiScalingEvidenceRecord[])[] = [
      [
        {
          ...evidence,
          terms: [{ ...firstTerm, groupId: "skill" }, secondTerm]
        }
      ],
      [
        {
          ...evidence,
          terms: [{ ...firstTerm, parameterIndex: 999 }, secondTerm]
        }
      ],
      [
        {
          ...evidence,
          terms: [{ ...firstTerm, talentSlot: "skill" }, secondTerm]
        }
      ],
      [
        {
          ...evidence,
          terms: [
            {
              ...firstTerm,
              snapshotChecks: [
                { ...firstTerm.snapshotChecks[0], expectedCoefficient: 0 },
                secondSnapshotCheck
              ]
            },
            secondTerm
          ]
        }
      ]
    ]

    for (const reviewedMultiScalingEvidence of mismatchedEvidenceSets) {
      const report = validateCombatRegistryIntegrity({
        gameData,
        registry: [createCoverage("Dehya", [action])],
        reviewedMultiScalingEvidence
      })

      expect(report.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            actionId: "dehya.burst.flame_manes_fist",
            code: "reviewed-multi-scaling-evidence-source-mismatch",
            damagePartId: "flame-manes-fist"
          })
        ])
      )
    }
  })

  it("proves every current declared talent parameter exists in the pinned snapshot", () => {
    const report = validateCombatRegistryIntegrity({ gameData })

    expect(report).toEqual({ isValid: true, issues: [] })
    expect(() => assertCombatRegistryIntegrity({ gameData })).not.toThrow()
  }, 20_000)

  it("rejects intrinsic effects without a declared source or complete bounded-state lookup", () => {
    const xiao = requireCoverage("Xiao")
    const action = xiao.actions.find((entry) => entry.id === "xiao.burst.bane_of_all_evil.high_plunge")
    const a1Effect = action?.intrinsicEffects?.find(
      (effect) => effect.kind === "flat" && effect.coefficientParameterId === "a1-bane-damage-bonus-per-stage"
    )
    if (!action || !a1Effect || !a1Effect.scenarioParameterMultiplier) {
      throw new Error("Expected Xiao's selected action to declare its bounded A1 effect")
    }
    const invalidSource = {
      ...action,
      id: "test.xiao.intrinsic-effect.missing-source",
      intrinsicEffects: [{ ...a1Effect, coefficientParameterId: "missing-intrinsic-source" }]
    }
    const invalidLookup = {
      ...action,
      id: "test.xiao.intrinsic-effect.incomplete-lookup",
      intrinsicEffects: [
        {
          ...a1Effect,
          scenarioParameterMultiplier: {
            ...a1Effect.scenarioParameterMultiplier,
            values: [{ multiplier: 1, parameterValue: 0 }]
          }
        }
      ]
    }
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [createCoverage("Xiao", [invalidSource, invalidLookup])]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionId: "test.xiao.intrinsic-effect.missing-source",
          code: "invalid-action-intrinsic-effect",
          parameterId: "missing-intrinsic-source"
        }),
        expect.objectContaining({
          actionId: "test.xiao.intrinsic-effect.incomplete-lookup",
          code: "invalid-action-intrinsic-effect",
          parameterId: "a1-bane-extra-stage-count"
        })
      ])
    )
  })

  it("rejects conflicting static caps and invalid affine intrinsic-effect multipliers", () => {
    const traveler = requireCoverage("Traveler")
    const travelerAction = traveler.actions.find((entry) => entry.id === "traveler.dendro.skill.razorgrass_blade")
    const travelerEffect = travelerAction?.intrinsicEffects?.[0]
    const mavuika = requireCoverage("Mavuika")
    const mavuikaAction = mavuika.actions.find(
      (entry) => entry.id === "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize"
    )
    const mavuikaEffect = mavuikaAction?.intrinsicEffects?.[0]
    if (
      !travelerAction ||
      !travelerEffect ||
      travelerEffect.kind !== "source_stat" ||
      !mavuikaAction ||
      !mavuikaEffect ||
      mavuikaEffect.kind !== "flat" ||
      !mavuikaEffect.scenarioParameterMultiplier ||
      "values" in mavuikaEffect.scenarioParameterMultiplier
    ) {
      throw new Error("Expected Traveler and Mavuika to declare the reviewed intrinsic effects")
    }
    const invalidStaticCap = {
      ...travelerAction,
      id: "test.traveler.intrinsic-effect.invalid-static-cap",
      intrinsicEffects: [{ ...travelerEffect, maximumValue: -0.01 }]
    }
    const conflictingCaps = {
      ...travelerAction,
      id: "test.traveler.intrinsic-effect.conflicting-caps",
      intrinsicEffects: [
        { ...travelerEffect, maximumValueParameterId: travelerEffect.coefficientParameterId }
      ]
    }
    const invalidLinearMultiplier = {
      ...mavuikaAction,
      id: "test.mavuika.intrinsic-effect.invalid-linear-multiplier",
      intrinsicEffects: [
        {
          ...mavuikaEffect,
          scenarioParameterMultiplier: {
            ...mavuikaEffect.scenarioParameterMultiplier,
            perParameterValue: -1
          }
        }
      ]
    }
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Traveler", [invalidStaticCap, conflictingCaps]),
        createCoverage("Mavuika", [invalidLinearMultiplier])
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionId: "test.traveler.intrinsic-effect.invalid-static-cap",
          code: "invalid-action-intrinsic-effect"
        }),
        expect.objectContaining({
          actionId: "test.traveler.intrinsic-effect.conflicting-caps",
          code: "invalid-action-intrinsic-effect"
        }),
        expect.objectContaining({
          actionId: "test.mavuika.intrinsic-effect.invalid-linear-multiplier",
          code: "invalid-action-intrinsic-effect"
        })
      ])
    )
  })

  it("limits capped stat-to-Attack conversions to valid actions and validates both source ratios", () => {
    const huTao = requireCoverage("HuTao")
    const action = huTao.actions.find(
      (entry) => entry.id === "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.hydro_aura_vaporize"
    )
    const conversion = action?.cappedStatToAttackConversion
    if (!action || !conversion) {
      throw new Error("Expected Hu Tao's Paramita Papilio action to declare a capped conversion")
    }

    expect(validateCombatRegistryIntegrity({ gameData, registry: [createCoverage("HuTao", [action])] })).toEqual({
      isValid: true,
      issues: []
    })

    const invalidPlacementReport = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("HuTao", [
          { ...action, id: "test.hu-tao.capped-conversion.draft", status: "draft" },
          { ...action, id: "test.hu-tao.capped-conversion.non-attack", scalingStat: "hp" }
        ])
      ]
    })
    expect(invalidPlacementReport.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionId: "test.hu-tao.capped-conversion.draft",
          code: "invalid-action-capped-stat-to-attack-conversion"
        }),
        expect.objectContaining({
          actionId: "test.hu-tao.capped-conversion.non-attack",
          code: "invalid-action-capped-stat-to-attack-conversion"
        })
      ])
    )

    const missingReferencesReport = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("HuTao", [
          {
            ...action,
            cappedStatToAttackConversion: {
              ...conversion,
              capRatioParameterId: "missing-cap-ratio",
              ratioParameterId: "missing-ratio"
            }
          }
        ])
      ]
    })
    expect(missingReferencesReport.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid-action-capped-stat-to-attack-conversion",
          parameterId: "missing-ratio"
        }),
        expect.objectContaining({
          code: "invalid-action-capped-stat-to-attack-conversion",
          parameterId: "missing-cap-ratio"
        })
      ])
    )

    const snapshotDriftReport = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("HuTao", [
          {
            ...action,
            cappedStatToAttackConversion: {
              ...conversion,
              capRatioSnapshotChecks: [{ expectedCoefficient: 3, talentLevel: 10 }],
              ratioSnapshotChecks: [{ expectedCoefficient: 0.06, talentLevel: 10 }]
            }
          }
        ])
      ]
    })
    expect(snapshotDriftReport.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actualCoefficient: 0.06256,
          code: "talent-coefficient-snapshot-mismatch",
          damagePartId: "capped-stat-to-attack-conversion-ratio",
          expectedCoefficient: 0.06,
          parameterId: "paramita-papilio-attack-increase",
          talentLevel: 10
        }),
        expect.objectContaining({
          actualCoefficient: 4,
          code: "talent-coefficient-snapshot-mismatch",
          damagePartId: "capped-stat-to-attack-conversion-cap-ratio",
          expectedCoefficient: 3,
          parameterId: "paramita-papilio-max-attack-increase",
          talentLevel: 10
        })
      ])
    )
  })

  it("validates Bennett's self-owned healing and attack-buff metric parameters against the pinned snapshot", () => {
    const bennett = requireCoverage("Bennett")

    expect(bennett.metrics).toEqual([
      expect.objectContaining({ id: "bennett.burst.field.heal_tick", kind: "healing", status: "verified" }),
      expect.objectContaining({ id: "bennett.burst.field.attack_buff", kind: "stat_buff", status: "verified" })
    ])
    expect(validateCombatRegistryIntegrity({ gameData, registry: [bennett] })).toEqual({ isValid: true, issues: [] })
  })

  it("rejects duplicate, detached, and snapshot-drifted self metrics", () => {
    const bennett = requireCoverage("Bennett")
    const healingMetric = bennett.metrics?.find((metric) => metric.kind === "healing")
    if (!healingMetric) throw new Error("Expected Bennett healing metric")

    const duplicateReport = validateCombatRegistryIntegrity({
      gameData,
      registry: [createCoverage("Bennett", bennett.actions, [healingMetric, { ...healingMetric }])]
    })
    expect(duplicateReport.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "duplicate-metric-id", metricId: healingMetric.id })])
    )

    const detachedReport = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Bennett", bennett.actions, [
          { ...healingMetric, sourceActionId: "bennett.burst.missing_field" }
        ])
      ]
    })
    expect(detachedReport.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "missing-metric-source-action", metricId: healingMetric.id })])
    )

    const driftedReport = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Bennett", bennett.actions, [
          {
            ...healingMetric,
            percentageParameter: {
              ...healingMetric.percentageParameter,
              snapshotChecks: [{ expectedValue: 0.2, talentLevel: 10 }]
            }
          }
        ])
      ]
    })
    expect(driftedReport.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "metric-parameter-snapshot-mismatch",
          metricId: healingMetric.id,
          parameterId: "healing-percentage"
        })
      ])
    )
  })

  it("rejects malformed targets and recipient requirements before a support metric reaches evaluation", () => {
    const bennett = requireCoverage("Bennett")
    const healingMetric = bennett.metrics?.find((metric) => metric.kind === "healing")
    if (!healingMetric) throw new Error("Expected Bennett healing metric")
    const healthRequirement = healingMetric.recipientRequirements.find(
      (requirement) => requirement.kind === "recipient_hp_fraction"
    )
    if (!healthRequirement) throw new Error("Expected Bennett healing HP requirement")

    const invalidTargetReport = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Bennett", bennett.actions, [{ ...healingMetric, target: "enemy" } as never])
      ]
    })
    const invalidRequirementReport = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Bennett", bennett.actions, [
          {
            ...healingMetric,
            recipientRequirements: [{ ...healthRequirement, threshold: 1.1 }]
          }
        ])
      ]
    })

    expect(invalidTargetReport.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid-metric-target", metricId: healingMetric.id })
      ])
    )
    expect(invalidRequirementReport.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid-metric-recipient-requirement", metricId: healingMetric.id })
      ])
    )
  })

  it("rejects duplicate action IDs and actions assigned to a different coverage character", () => {
    const raiden = requireCoverage("RaidenShogun")
    const bennett = requireCoverage("Bennett")
    const raidenAction = requireAction(raiden)
    const bennettAction = requireAction(bennett)
    const registry = [
      createCoverage("RaidenShogun", [{ ...raidenAction, id: "shared.action" }]),
      createCoverage("Bennett", [{ ...bennettAction, id: "shared.action", characterId: "RaidenShogun" }])
    ]
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actionId: "shared.action", code: "duplicate-action-id" }),
        expect.objectContaining({ actionId: "shared.action", code: "action-character-mismatch" })
      ])
    )
    expect(() => assertCombatRegistryIntegrity({ gameData, registry })).toThrow("[duplicate-action-id]")
  })

  it("rejects talent references that do not exist for their canonical coverage character", () => {
    const raiden = requireCoverage("RaidenShogun")
    const action = requireAction(raiden)
    const registry = [
      createCoverage("RaidenShogun", [
        {
          ...action,
          parameterReferences: [
            {
              groupId: "burst",
              id: "missing-coefficient",
              parameterIndex: 999,
              source: "talent",
              talentSlot: "burst"
            }
          ]
        }
      ])
    ]
    const report = validateCombatRegistryIntegrity({ gameData, registry })

    expect(report.isValid).toBe(false)
    expect(report.issues).toEqual(
      expect.arrayContaining([
        {
          actionId: "raiden.burst.initial_slash",
          characterId: "RaidenShogun",
          code: "missing-talent-parameter",
          message: expect.any(String),
          parameterId: "missing-coefficient"
        }
      ])
    )
  })

  it("requires every verified declared-direct action to map unique damage parts to declared talent references", () => {
    const xingqiu = requireCoverage("Xingqiu")
    const action = requireAction(xingqiu)
    const missingPartsReport = validateCombatRegistryIntegrity({
      gameData,
      registry: [createCoverage("Xingqiu", [{ ...action, damageParts: [] }])]
    })
    const malformedPartsReport = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Xingqiu", [
          {
            ...action,
            damageParts: [
              { coefficientParameterId: "first-hit-multiplier", id: "rainscreen-hit" },
              { coefficientParameterId: "not-a-declared-talent-reference", id: "rainscreen-hit" }
            ]
          }
        ])
      ]
    })

    expect(missingPartsReport.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionId: "xingqiu.skill.fatal_rainscreen",
          code: "missing-declared-direct-damage-parts"
        })
      ])
    )
    expect(malformedPartsReport.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "duplicate-damage-part-id", damagePartId: "rainscreen-hit" }),
        expect.objectContaining({
          code: "missing-damage-part-coefficient-reference",
          damagePartId: "rainscreen-hit",
          parameterId: "not-a-declared-talent-reference"
        })
      ])
    )
  })

  it("rejects malformed explicit damage-event timelines before they can silently drop a hit", () => {
    const xingqiu = requireCoverage("Xingqiu")
    const action = requireAction(xingqiu)
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Xingqiu", [
          {
            ...action,
            timeline: {
              damageEvents: [
                { at: 0, damagePartId: "first-hit", id: "repeated-event", snapshot: "cast" },
                { at: -0.1, damagePartId: "missing-hit", id: "repeated-event", snapshot: "hit" }
              ],
              duration: 1
            }
          } satisfies CombatActionMetadata
        ])
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "duplicate-damage-event-id" }),
        expect.objectContaining({ code: "invalid-damage-event-time" }),
        expect.objectContaining({ code: "missing-damage-event-part", damagePartId: "missing-hit" }),
        expect.objectContaining({ code: "unmapped-declared-damage-part", damagePartId: "second-hit" })
      ])
    )
  })

  it("rejects an action timeline whose valid events are not ordered by time", () => {
    const xingqiu = requireCoverage("Xingqiu")
    const action = requireAction(xingqiu)
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Xingqiu", [
          {
            ...action,
            timeline: {
              damageEvents: [
                { at: 0.5, damagePartId: "first-hit", id: "first-hit", snapshot: "cast" },
                { at: 0.25, damagePartId: "second-hit", id: "second-hit", snapshot: "hit" }
              ],
              duration: 0.7
            }
          } satisfies CombatActionMetadata
        ])
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid-damage-event-time",
          damageEventId: "second-hit"
        })
      ])
    )
  })

  it("rejects parameterized damage events that reference undeclared action state", () => {
    const navia = requireCoverage("Navia")
    const action = navia.actions.find((candidate) => candidate.id === "navia.skill.ceremonial_crystalshot")
    if (!action?.timeline || !action.scenarioParameters) throw new Error("Expected Navia's parameterized Crystalshot")
    const [firstParameter] = action.scenarioParameters
    const [firstEvent] = action.timeline.damageEvents
    if (!firstParameter || !firstEvent) throw new Error("Expected Navia's declared Crystalshot parameter and event")

    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Navia", [
          {
            ...action,
            scenarioParameters: [firstParameter, { ...firstParameter }],
            timeline: {
              ...action.timeline,
              damageEvents: [
                {
                  ...firstEvent,
                  coefficientMultiplier: {
                    kind: "scenario_parameter_lookup",
                    parameterId: "missing-parameter",
                    values: [{ multiplier: 1, parameterValue: 1 }]
                  },
                  hitCount: { kind: "scenario_parameter", parameterId: "missing-parameter" }
                }
              ]
            }
          } satisfies CombatActionMetadata
        ])
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "duplicate-action-scenario-parameter-id" }),
        expect.objectContaining({ code: "invalid-action-scenario-parameter-reference" })
      ])
    )
  })

  it("rejects timelines that no declared-direct damage evaluator can execute", () => {
    const bennett = requireCoverage("Bennett")
    const supportAction = bennett.actions.find((action) => action.kind === "support")
    if (!supportAction) throw new Error("Expected Bennett to declare a support action")

    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Bennett", [
          {
            ...supportAction,
            timeline: {
              damageEvents: [{ at: 0, damagePartId: "field", id: "field", snapshot: "cast" }],
              duration: 1
            }
          } satisfies CombatActionMetadata
        ])
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "timeline-unsupported-evaluator" })])
    )
  })

  it("rejects an elemental-override tag on a catalyst normal attack", () => {
    const barbara = requireCoverage("Barbara")
    const action = requireAction(barbara)
    const firstPart = action.damageParts?.[0]
    if (!firstPart) throw new Error("Expected Barbara to declare a normal-attack damage part")
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Barbara", [
          {
            ...action,
            element: "physical",
            timeline: {
              damageEvents: [
                {
                  at: 0,
                  damagePartId: firstPart.id,
                  elementOverrideTarget: "normal_attack",
                  id: "invalid-infused-catalyst-hit",
                  snapshot: "hit"
                }
              ],
              duration: 1
            }
          } as unknown as CombatActionMetadata
        ])
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionId: action.id,
          code: "invalid-element-override-action",
          damageEventId: "invalid-infused-catalyst-hit"
        })
      ])
    )
  })

  it("validates the source ownership and pinned duration values of an elemental override effect", () => {
    const chongyun = requireCoverage("Chongyun")
    const effect = chongyun.effects?.[0]
    if (!effect) throw new Error("Expected Chongyun to declare an elemental override effect")
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        {
          ...createCoverage("Chongyun", []),
          effects: [
            {
              ...effect,
              durationChecks: [{ expectedCoefficient: 999, talentLevel: 1 }],
              sourceCharacterId: "Bennett"
            }
          ]
        }
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "effect-character-mismatch",
          effectId: "chongyun.skill.chonghuas_frost_field"
        }),
        expect.objectContaining({
          code: "effect-duration-snapshot-mismatch",
          effectId: "chongyun.skill.chonghuas_frost_field"
        })
      ])
    )
  })

  it("rejects declared-direct scaling shapes that its evaluator cannot compile", () => {
    const dehya = requireCoverage("Dehya")
    const action = requireAction(dehya)
    const flameManesFist = action.damageParts?.find((part) => part.id === "flame-manes-fist")
    if (!flameManesFist || flameManesFist.scalingTerms === undefined) {
      throw new Error("Expected Dehya's action to declare one mixed-scaling part")
    }

    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Dehya", [
          {
            ...action,
            damageParts: [
              flameManesFist,
              { coefficientParameterId: "flame-manes-fist-attack", id: "unsupported-second-part" }
            ]
          } satisfies CombatActionMetadata
        ])
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "invalid-declared-direct-scaling-shape" })])
    )
  })

  it("rejects unsupported timeline snapshots and action-level reaction assumptions", () => {
    const xiangling = requireCoverage("Xiangling")
    const action = requireAction(xiangling)
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Xiangling", [
          {
            ...action,
            timeline: {
              damageEvents: [
                { at: 0, damagePartId: "pyronado-tick", id: "pyronado-tick", snapshot: "dynamic" }
              ],
              duration: 1
            }
          } as unknown as CombatActionMetadata
        ])
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid-damage-event-snapshot", damageEventId: "pyronado-tick" }),
        expect.objectContaining({ code: "timeline-action-level-reaction-unsupported" })
      ])
    )
  })

  it("rejects missing, non-finite, out-of-duration, and post-hit explicit snapshot times", () => {
    const xingqiu = requireCoverage("Xingqiu")
    const action = requireAction(xingqiu)
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Xingqiu", [
          {
            ...action,
            timeline: {
              damageEvents: [
                {
                  at: 0.1,
                  damagePartId: "first-hit",
                  id: "missing-snapshot-time",
                  snapshot: "time"
                },
                {
                  at: 0.2,
                  damagePartId: "second-hit",
                  id: "non-finite-snapshot-time",
                  snapshot: "time",
                  snapshotAt: Number.POSITIVE_INFINITY
                },
                {
                  at: 0.3,
                  damagePartId: "first-hit",
                  id: "post-hit-snapshot-time",
                  snapshot: "time",
                  snapshotAt: 0.4
                },
                {
                  at: 0.4,
                  damagePartId: "second-hit",
                  id: "out-of-duration-snapshot-time",
                  snapshot: "time",
                  snapshotAt: 0.8
                }
              ],
              duration: 0.7
            }
          } as unknown as CombatActionMetadata
        ])
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid-damage-event-snapshot-time",
          damageEventId: "missing-snapshot-time"
        }),
        expect.objectContaining({
          code: "invalid-damage-event-snapshot-time",
          damageEventId: "non-finite-snapshot-time"
        }),
        expect.objectContaining({
          code: "invalid-damage-event-snapshot-time",
          damageEventId: "post-hit-snapshot-time"
        }),
        expect.objectContaining({
          code: "invalid-damage-event-snapshot-time",
          damageEventId: "out-of-duration-snapshot-time"
        })
      ])
    )
  })

  it("rejects a timed elemental application with an invalid standard ICD group", () => {
    const xingqiu = requireCoverage("Xingqiu")
    const action = requireAction(xingqiu)
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Xingqiu", [
          {
            ...action,
            timeline: {
              damageEvents: [
                {
                  at: 0,
                  damagePartId: "first-hit",
                  elementalApplication: { icd: { groupId: "   ", kind: "standard" } },
                  id: "first-hit",
                  snapshot: "cast"
                },
                { at: 0.35, damagePartId: "second-hit", id: "second-hit", snapshot: "hit" }
              ],
              duration: 0.7
            }
          } as unknown as CombatActionMetadata
        ])
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "invalid-elemental-application-icd" })])
    )
  })

  it("rejects a timed elemental application with a non-finite reaction bonus", () => {
    const xingqiu = requireCoverage("Xingqiu")
    const action = requireAction(xingqiu)
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Xingqiu", [
          {
            ...action,
            timeline: {
              damageEvents: [
                {
                  at: 0,
                  damagePartId: "first-hit",
                  elementalApplication: { icd: { kind: "none" }, reactionBonus: Number.NaN },
                  id: "first-hit",
                  snapshot: "cast"
                },
                { at: 0.35, damagePartId: "second-hit", id: "second-hit", snapshot: "hit" }
              ],
              duration: 0.7
            }
          } as unknown as CombatActionMetadata
        ])
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "invalid-elemental-application-reaction-bonus" })])
    )
  })

  it("rejects a locked damage-part coefficient that drifts from the pinned snapshot", () => {
    const bennett = requireCoverage("Bennett")
    const action = requireAction(bennett)
    const initialHit = action.damageParts?.find(
      (part): part is SingleScalingCombatDamagePart =>
        part.id === "initial-hit" && part.coefficientParameterId !== undefined
    )
    if (!initialHit) {
      throw new Error("Expected Bennett's initial hit to declare a single-scaling damage part")
    }

    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Bennett", [
          {
            ...action,
            damageParts: [
              {
                ...initialHit,
                snapshotChecks: [{ expectedCoefficient: 4.2, talentLevel: 10 }]
              }
            ]
          }
        ])
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionId: "bennett.burst.initial_hit",
          actualCoefficient: 4.1904,
          code: "talent-coefficient-snapshot-mismatch",
          damagePartId: "initial-hit",
          expectedCoefficient: 4.2,
          parameterId: "initial-hit-multiplier",
          talentLevel: 10
        })
      ])
    )
  })

  it("validates every stat-specific coefficient inside a mixed-scaling damage part", () => {
    const dehya = requireCoverage("Dehya")
    const action = requireAction(dehya)
    const flameManesFist = action.damageParts?.find((part) => part.id === "flame-manes-fist")
    if (!flameManesFist || flameManesFist.scalingTerms === undefined) {
      throw new Error("Expected Dehya's Flame-Mane's Fist to declare mixed scaling terms")
    }
    const [attackTerm, hpTerm] = flameManesFist.scalingTerms
    if (!attackTerm || !hpTerm) throw new Error("Expected Dehya's hit to have attack and health scaling terms")

    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Dehya", [
          {
            ...action,
            damageParts: [
              {
                ...flameManesFist,
                scalingTerms: [attackTerm, { ...hpTerm, snapshotChecks: [{ expectedCoefficient: 0.03, talentLevel: 10 }] }]
              }
            ]
          }
        ])
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actualCoefficient: 0.030456,
          code: "talent-coefficient-snapshot-mismatch",
          damagePartId: "flame-manes-fist",
          expectedCoefficient: 0.03,
          parameterId: "flame-manes-fist-hp",
          talentLevel: 10
        })
      ])
    )
  })

  it("validates a declared multiplier coefficient inside a mixed-scaling damage term", () => {
    const dehya = requireCoverage("Dehya")
    const action = requireAction(dehya)
    const flameManesFist = action.damageParts?.find((part) => part.id === "flame-manes-fist")
    if (!flameManesFist || flameManesFist.scalingTerms === undefined) {
      throw new Error("Expected Dehya's Flame-Mane's Fist to declare mixed scaling terms")
    }
    const [attackTerm, hpTerm] = flameManesFist.scalingTerms
    if (!attackTerm || !hpTerm) throw new Error("Expected Dehya's hit to have attack and health scaling terms")

    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Dehya", [
          {
            ...action,
            damageParts: [
              {
                ...flameManesFist,
                scalingTerms: [
                  attackTerm,
                  { ...hpTerm, coefficientMultiplierParameterId: "missing-conversion-ratio" }
                ]
              }
            ]
          }
        ])
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing-damage-part-coefficient-reference",
          damagePartId: "flame-manes-fist",
          parameterId: "missing-conversion-ratio"
        })
      ])
    )
  })

  it("requires reviewed mixed-scaling evidence to declare a coefficient multiplier", () => {
    const dehya = requireCoverage("Dehya")
    const action = requireAction(dehya)
    const flameManesFist = action.damageParts?.find((part) => part.id === "flame-manes-fist")
    if (!flameManesFist || flameManesFist.scalingTerms === undefined) {
      throw new Error("Expected Dehya's Flame-Mane's Fist to declare mixed scaling terms")
    }
    const [attackTerm, hpTerm] = flameManesFist.scalingTerms
    if (!attackTerm || !hpTerm) throw new Error("Expected Dehya's hit to have attack and health scaling terms")

    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Dehya", [
          {
            ...action,
            damageParts: [
              {
                ...flameManesFist,
                scalingTerms: [
                  attackTerm,
                  { ...hpTerm, coefficientMultiplierParameterId: "flame-manes-fist-attack" }
                ]
              }
            ]
          }
        ])
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "reviewed-multi-scaling-evidence-term-mismatch",
          damagePartId: "flame-manes-fist"
        })
      ])
    )
  })

  it("validates snapshot checks for a mixed-scaling coefficient multiplier", () => {
    const noelle = requireCoverage("Noelle")
    const action = noelle.actions.find((entry) => entry.id === "noelle.burst.sweeping_time.normal_attack_combo")
    const firstHit = action?.damageParts?.find((part) => part.id === "sweeping-time-normal-hit-one")
    if (!action || !firstHit || firstHit.scalingTerms === undefined) {
      throw new Error("Expected Noelle's Sweeping Time normal combo to declare mixed scaling terms")
    }
    const [attackTerm, defenseTerm] = firstHit.scalingTerms
    if (!attackTerm || !defenseTerm) throw new Error("Expected Noelle's first hit to have attack and defense terms")

    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Noelle", [
          {
            ...action,
            damageParts: action.damageParts?.map((part) =>
              part.id !== firstHit.id
                ? part
                : {
                    ...firstHit,
                    scalingTerms: [
                      attackTerm,
                      {
                        ...defenseTerm,
                        coefficientMultiplierSnapshotChecks: [{ expectedCoefficient: 0.7, talentLevel: 10 }]
                      }
                    ]
                  }
            )
          } as unknown as CombatActionMetadata
        ])
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionId: "noelle.burst.sweeping_time.normal_attack_combo",
          actualCoefficient: 0.72,
          code: "talent-coefficient-snapshot-mismatch",
          damagePartId: "sweeping-time-normal-hit-one",
          expectedCoefficient: 0.7,
          parameterId: "sweeping-time-defense-to-attack-ratio",
          talentLevel: 10
        })
      ])
    )
  })

  it("does not require damage parts from special or support actions", () => {
    const raiden = requireCoverage("RaidenShogun")
    const bennett = requireCoverage("Bennett")
    const raidenAction = requireAction(raiden)
    const bennettSupportAction = bennett.actions.find((action) => action.kind === "support")
    if (!bennettSupportAction) throw new Error("Expected Bennett to declare one support action")

    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("RaidenShogun", [raidenAction]),
        createCoverage("Bennett", [
          {
            ...bennettSupportAction,
            damageKind: "direct",
            evaluator: "declared_direct",
            status: "verified"
          }
        ])
      ]
    })

    expect(report).toEqual({ isValid: true, issues: [] })
  })

  it("rejects duplicated coverage characters and non-canonical snapshot character IDs", () => {
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [createCoverage("NotInSnapshot", []), createCoverage("NotInSnapshot", [])]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ characterId: "NotInSnapshot", code: "missing-snapshot-character" }),
        expect.objectContaining({ characterId: "NotInSnapshot", code: "duplicate-character-id" })
      ])
    )
  })

  it("validates a static Traveler action against its explicitly declared talent parameter owner", () => {
    const travelerAction: CombatActionMetadata = {
      characterId: "Traveler",
      damageKind: "direct",
      damageParts: [{ coefficientParameterId: "first-hit-multiplier", id: "first-hit" }],
      element: "anemo",
      evaluator: "declared_direct",
      id: "test.traveler.anemo.normal",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "first-hit-multiplier",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentParameterOwnerId: "TravelerAnemoF",
      talentSlot: "normal"
    }

    expect(
      validateCombatRegistryIntegrity({
        gameData,
        registry: [createCoverage("Traveler", [travelerAction])]
      })
    ).toEqual({ isValid: true, issues: [] })
  })

  it("validates an element-restricted Traveler action against both matching gender talent owners", () => {
    const action = createAnemoTravelerAction()

    expect(
      validateCombatRegistryIntegrity({
        gameData,
        registry: [createCoverage("Traveler", [action])]
      })
    ).toEqual({ isValid: true, issues: [] })
  })

  it("rejects invalid Traveler element eligibility declarations", () => {
    const action = createAnemoTravelerAction()
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("RaidenShogun", [{ ...action, characterId: "RaidenShogun", id: "test.not-traveler" }]),
        createCoverage("Traveler", [
          { ...action, id: "test.traveler.fixed-owner", talentParameterOwnerId: "TravelerAnemoF" }
        ])
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionId: "test.not-traveler",
          code: "invalid-traveler-element-eligibility"
        }),
        expect.objectContaining({
          actionId: "test.traveler.fixed-owner",
          code: "invalid-traveler-element-eligibility"
        })
      ])
    )
  })

  it("reports independently when either Traveler gender table drifts from an action snapshot", () => {
    const action = createAnemoTravelerAction({
      damageParts: [
        {
          coefficientParameterId: "gender-specific-normal-hit",
          id: "gender-specific-normal-hit",
          snapshotChecks: [{ expectedCoefficient: 0.7224, talentLevel: 1 }]
        }
      ]
    })
    const maleDriftReport = validateCombatRegistryIntegrity({
      gameData,
      registry: [createCoverage("Traveler", [action])]
    })
    const femaleDriftReport = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Traveler", [
          {
            ...action,
            damageParts: [
              {
                coefficientParameterId: "gender-specific-normal-hit",
                id: "gender-specific-normal-hit",
                snapshotChecks: [{ expectedCoefficient: 0.60716, talentLevel: 1 }]
              }
            ]
          }
        ])
      ]
    })

    expect(maleDriftReport.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actualCoefficient: 0.60716,
          code: "talent-coefficient-snapshot-mismatch",
          expectedCoefficient: 0.7224
        })
      ])
    )
    expect(maleDriftReport.issues.some((issue) => issue.message.includes("TravelerAnemoM"))).toBe(true)
    expect(femaleDriftReport.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actualCoefficient: 0.7224,
          code: "talent-coefficient-snapshot-mismatch",
          expectedCoefficient: 0.60716
        })
      ])
    )
    expect(femaleDriftReport.issues.some((issue) => issue.message.includes("TravelerAnemoF"))).toBe(true)
  })

  it("reports missing Traveler action parameters for each matching gender owner", () => {
    const action = createAnemoTravelerAction({
      damageParts: [{ coefficientParameterId: "missing-gender-specific-parameter", id: "missing-hit" }],
      parameterReferences: [
        {
          groupId: "auto",
          id: "missing-gender-specific-parameter",
          parameterIndex: 999,
          source: "talent",
          talentSlot: "normal"
        }
      ]
    })
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [createCoverage("Traveler", [action])]
    })
    const missingParameterIssues = report.issues.filter(
      (issue) => issue.code === "missing-talent-parameter" && issue.parameterId === "missing-gender-specific-parameter"
    )

    expect(missingParameterIssues).toHaveLength(2)
    expect(missingParameterIssues.some((issue) => issue.message.includes("TravelerAnemoF"))).toBe(true)
    expect(missingParameterIssues.some((issue) => issue.message.includes("TravelerAnemoM"))).toBe(true)
  })

  it("validates element-restricted Traveler metric parameters against both gender owners", () => {
    const action = createAnemoTravelerAction()
    const metric: CombatMetricDefinition = {
      characterId: "Traveler",
      id: "test.traveler.anemo.gender-specific-metric",
      kind: "scalar",
      label: "Gender-specific metric",
      ratioParameter: {
        reference: {
          groupId: "auto",
          id: "gender-specific-normal-hit",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "normal"
        },
        snapshotChecks: [{ expectedValue: 0.7224, talentLevel: 1 }]
      },
      semantic: "damage_bonus",
      sourceActionId: action.id,
      status: "verified",
      target: "self",
      unit: "ratio"
    }
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [createCoverage("Traveler", [action], [metric])]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actualValue: 0.60716,
          code: "metric-parameter-snapshot-mismatch",
          expectedValue: 0.7224,
          metricId: metric.id
        })
      ])
    )
    expect(report.issues.some((issue) => issue.message.includes("TravelerAnemoM"))).toBe(true)
  })

  it("rejects a Spread declaration on a non-Dendro hit", () => {
    const collei = requireCoverage("Collei")
    const action = requireAction(collei)
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [createCoverage("Collei", [{ ...action, element: "pyro" }])]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionId: "collei.skill.floral_sidewinder.outbound.spread",
          code: "additive-reaction-element-mismatch"
        })
      ])
    )
  })

  it("rejects an action that declares both amplifying and additive reactions", () => {
    const xiangling = requireCoverage("Xiangling")
    const action = requireAction(xiangling)
    const report = validateCombatRegistryIntegrity({
      gameData,
      registry: [
        createCoverage("Xiangling", [
          { ...action, additiveReaction: { bonus: 0, kind: "aggravate" } }
        ])
      ]
    })

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionId: "xiangling.burst.pyronado.reverse_vaporize",
          code: "conflicting-reaction-declarations"
        })
      ])
    )
  })
})
