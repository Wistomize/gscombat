import type { CharacterCombatCoverage } from "../../combat/types.js"

import { cynoDefinition } from "./definition.js"

export const cynoCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Cyno",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "secret-rite-chasmic-soulfarer-ordinary-damage",
          id: "secret-rite-chasmic-soulfarer-ordinary",
          snapshotChecks: [
            { expectedCoefficient: 1.304, talentLevel: 1 },
            { expectedCoefficient: 2.3472, talentLevel: 10 }
          ]
        }
      ],
      element: cynoDefinition.element,
      evaluator: "declared_direct",
      id: "cyno.skill.secret_rite_chasmic_soulfarer.ordinary",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "secret-rite-chasmic-soulfarer-ordinary-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Cyno",
      damageKind: "direct",
      damageParts: [
        {
          id: "pactsworn-pathclearer-normal-attack-first-hit",
          scalingTerms: [
            {
              coefficientParameterId: "pactsworn-pathclearer-normal-attack-first-hit-damage",
              snapshotChecks: [
                { expectedCoefficient: 0.782832, talentLevel: 1 },
                { expectedCoefficient: 1.547459, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "featherfall-judgment-normal-attack-elemental-mastery-ratio",
              minimumSourceAscension: 4,
              snapshotChecks: [{ expectedCoefficient: 1.5, talentLevel: 1 }],
              stat: "elementalMastery"
            }
          ]
        }
      ],
      deterministicSnapshotCapabilities: ["after_primary_burst"],
      element: cynoDefinition.element,
      evaluator: "declared_direct",
      id: "cyno.burst.sacred_rite_wolfs_swiftness.pactsworn_pathclearer.normal.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "pactsworn-pathclearer-normal-attack-first-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "passive2",
          id: "featherfall-judgment-normal-attack-elemental-mastery-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "normal"
    },
    {
      characterId: "Cyno",
      damageKind: "direct",
      damageParts: [
        {
          id: "c6-duststalker-bolt",
          scalingTerms: [
            {
              coefficientParameterId: "c6-duststalker-bolt-attack-ratio",
              snapshotChecks: [{ expectedCoefficient: 1, talentLevel: 1 }],
              stat: "attack"
            },
            {
              coefficientParameterId: "c6-duststalker-bolt-elemental-mastery-ratio",
              snapshotChecks: [{ expectedCoefficient: 2.5, talentLevel: 1 }],
              stat: "elementalMastery"
            }
          ]
        }
      ],
      element: cynoDefinition.element,
      evaluator: "declared_direct",
      id: "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.no_reaction",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "passive1",
          id: "c6-duststalker-bolt-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "c6-duststalker-bolt-elemental-mastery-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-duststalker-bolt-ready",
          label: "C6 渡荒之雷已触发",
          maximumValue: 0,
          minimumValue: 0,
          rangeBySourceConstellation: [
            { defaultValue: 1, maximumValue: 1, minimumSourceConstellation: 6, minimumValue: 1 }
          ]
        }
      ],
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "c6-duststalker-bolt-ready",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-duststalker-bolt",
            id: "c6-duststalker-bolt",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      additiveReaction: { bonus: 0, kind: "aggravate" },
      characterId: "Cyno",
      damageKind: "direct",
      damageParts: [
        {
          id: "c6-duststalker-bolt",
          scalingTerms: [
            {
              coefficientParameterId: "c6-duststalker-bolt-attack-ratio",
              snapshotChecks: [{ expectedCoefficient: 1, talentLevel: 1 }],
              stat: "attack"
            },
            {
              coefficientParameterId: "c6-duststalker-bolt-elemental-mastery-ratio",
              snapshotChecks: [{ expectedCoefficient: 2.5, talentLevel: 1 }],
              stat: "elementalMastery"
            }
          ]
        }
      ],
      element: cynoDefinition.element,
      evaluator: "declared_direct",
      id: "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.aggravate",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "passive1",
          id: "c6-duststalker-bolt-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "c6-duststalker-bolt-elemental-mastery-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-duststalker-bolt-ready",
          label: "C6 渡荒之雷已触发",
          maximumValue: 0,
          minimumValue: 0,
          rangeBySourceConstellation: [
            { defaultValue: 1, maximumValue: 1, minimumSourceConstellation: 6, minimumValue: 1 }
          ]
        }
      ],
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "c6-duststalker-bolt-ready",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-duststalker-bolt",
            id: "c6-duststalker-bolt",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      characterId: "Cyno",
      damageKind: "direct",
      damageParts: [
        {
          id: "c6-stellar-duststalker-bolt",
          scalingTerms: [
            {
              coefficientParameterId: "c6-stellar-duststalker-bolt-attack-ratio",
              snapshotChecks: [{ expectedCoefficient: 2, talentLevel: 1 }],
              stat: "attack"
            },
            {
              coefficientParameterId: "c6-stellar-duststalker-bolt-elemental-mastery-ratio",
              minimumSourceAscension: 4,
              snapshotChecks: [{ expectedCoefficient: 6, talentLevel: 1 }],
              stat: "elementalMastery"
            }
          ]
        }
      ],
      element: cynoDefinition.element,
      evaluator: "declared_direct",
      id: "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.stellar_superconduct",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "passive1",
          id: "c6-stellar-duststalker-bolt-attack-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "c6-stellar-duststalker-bolt-elemental-mastery-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-stellar-duststalker-bolt-ready",
          label: "C6 渡荒之雷星超导已触发",
          maximumValue: 0,
          minimumValue: 0,
          rangeBySourceConstellation: [
            { defaultValue: 1, maximumValue: 1, minimumSourceConstellation: 6, minimumValue: 1 }
          ]
        },
        {
          defaultValue: 0,
          id: "stored-elemental-applications",
          label: "手填：当前极星辉域已储存元素附着次数（0–12次）",
          maximumValue: 12,
          minimumValue: 0
        }
      ],
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "c6-stellar-duststalker-bolt-ready",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-stellar-duststalker-bolt",
            id: "c6-stellar-duststalker-bolt",
            snapshot: "hit",
            specialReaction: {
              kind: "stellar_superconduct",
              stellarStoredElementalApplicationsParameterId: "stored-elemental-applications"
            }
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      activation: "automatic",
      id: "cyno.burst.sacred_rite_wolfs_swiftness.elemental_mastery",
      label: "圣仪·煟煌随狼行 · 启途誓使状态元素精通提高100点",
      source: { characterId: "Cyno", kind: "character" },
      target: "elementalMastery",
      targetFilter: {
        actionIds: [
          "cyno.burst.sacred_rite_wolfs_swiftness.pactsworn_pathclearer.normal.first_hit",
          "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.no_reaction",
          "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.aggravate",
          "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.stellar_superconduct"
        ],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 100 }
    },
    {
      activation: "maximum_reachable",
      id: "cyno.constellation.1.ordinance_unceasing_vigil.radiance.elemental_mastery",
      label: "立仪·俯览昼冥 · C1 辉映强化触发（元素精通提高200点）",
      source: { characterId: "Cyno", kind: "character", minimumSourceConstellation: 1 },
      target: "elementalMastery",
      targetFilter: {
        actionIds: [
          "cyno.burst.sacred_rite_wolfs_swiftness.pactsworn_pathclearer.normal.first_hit",
          "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.no_reaction",
          "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.aggravate",
          "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.stellar_superconduct"
        ],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 200 }
    },
    {
      activation: "maximum_reachable",
      id: "cyno.constellation.2.ceremony_homecoming_of_spirits.max_stacks.electro_damage_bonus",
      label: "令仪·引谒归灵 · C2 普通效果叠满5层（雷元素伤害加成50%）",
      source: { characterId: "Cyno", kind: "character", minimumSourceConstellation: 2 },
      target: "damageBonus",
      targetFilter: {
        actionIds: [
          "cyno.burst.sacred_rite_wolfs_swiftness.pactsworn_pathclearer.normal.first_hit",
          "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.no_reaction",
          "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.aggravate"
        ],
        elements: ["electro"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.5 }
    },
    {
      activation: "maximum_reachable",
      id: "cyno.constellation.2.ceremony_homecoming_of_spirits.radiance.max_stacks.stellar_superconduct_damage_bonus",
      label: "令仪·引谒归灵 · C2 辉映效果叠满5层（星超导伤害加成80%）",
      source: { characterId: "Cyno", kind: "character", minimumSourceConstellation: 2 },
      target: "specialReactionDamageBonus",
      targetFilter: { recipientSourceRelation: "source", specialReactionKinds: ["stellar_superconduct"] },
      value: { kind: "fixed", value: 0.8 }
    }
  ],
  characterId: "Cyno",
  metrics: [
    {
      actionId: "cyno.burst.sacred_rite_wolfs_swiftness.pactsworn_pathclearer.normal.first_hit",
      characterId: "Cyno",
      id: "cyno.burst.sacred_rite_wolfs_swiftness.pactsworn_pathclearer.normal.first_hit",
      kind: "damage",
      label: "圣仪·煟煌随狼行 / 启途誓使状态普攻一段（无反应）",
      sourceActionId: "cyno.burst.sacred_rite_wolfs_swiftness.pactsworn_pathclearer.normal.first_hit",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.no_reaction",
      characterId: "Cyno",
      id: "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.no_reaction",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "渡荒之雷 / C6 尘渡荒雷单次（无反应）",
      sourceActionId: "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.no_reaction",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.aggravate",
      characterId: "Cyno",
      id: "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.aggravate",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "渡荒之雷 / C6 尘渡荒雷单次·超激化",
      sourceActionId: "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.aggravate",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.stellar_superconduct",
      characterId: "Cyno",
      id: "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.stellar_superconduct",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "渡荒之雷 / C6 尘渡荒雷单次·星超导",
      sourceActionId: "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.stellar_superconduct",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One ordinary Secret Rite: Chasmic Soulfarer hit remains a verified lower-level Electro Skill action. The selected core action is exactly the first Pactsworn Pathclearer Normal Attack while Sacred Rite: Wolf's Swiftness is already active: Attack × burst[0]. That state automatically contributes the Burst's 100 Elemental Mastery, and at ascension 4+ Featherfall Judgment adds Elemental Mastery × passive2[0] (150%) before shared multipliers. C1's maximum-reachable Radiance state contributes another 200 Elemental Mastery. C2's maintained maximum ordinary state contributes 50% Electro damage, while its Radiance Stellar-Superconduct branch contributes 80% in the dedicated special-reaction damage-bonus stage. C6 has owner-scoped independent metrics: one Duststalker Bolt uses Cyno's own 100% Attack + 250% Elemental Mastery formula with mutually exclusive no-reaction and Aggravate branches, while its Stellar-Superconduct replacement combines 200% Attack and A4's 600% Elemental Mastery Starsame base term before the shared Stellar-Superconduct formula and stored-application input. Every C6 branch is zero below C6 and retains the applicable lower-constellation state above. The burst cast hit, later transformed normal hits, charged and plunge attacks, Mortuary Rite, Endseer timing, state duration, external buffs, and other character states remain excluded.",
  label: cynoDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
