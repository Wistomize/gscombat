import type { CharacterCombatCoverage } from "../../combat/types.js"

import { sandroneDefinition } from "./definition.js"

const sandroneC6ClusterBeamActionIds = {
  ordinary: "sandrone.constellation.6.narcissus_awaking.condensed_cluster_beam.ordinary",
  stellarSuperconduct: "sandrone.constellation.6.narcissus_awaking.condensed_cluster_beam.stellar_superconduct",
  stellarSwirl: "sandrone.constellation.6.narcissus_awaking.condensed_cluster_beam.stellar_swirl"
} as const

export const sandroneCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Sandrone",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.762863, talentLevel: 1 },
            { expectedCoefficient: 1.507985, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "sandrone.normal.auto.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "normal-attack-first-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal"
    },
    {
      characterId: "Sandrone",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "prism-bullet-damage",
          id: "prism-bullet",
          snapshotChecks: [
            { expectedCoefficient: 0.324, talentLevel: 1 },
            { expectedCoefficient: 0.5832, talentLevel: 10 }
          ]
        }
      ],
      element: sandroneDefinition.element,
      evaluator: "declared_direct",
      id: "sandrone.skill.phenomenon_calculus.prism_bullet",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "prism-bullet-damage",
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
      characterId: "Sandrone",
      damageKind: "special_reaction",
      damageParts: [
        {
          coefficientParameterId: "prism-bullet-stellar-superconduct-damage",
          id: "prism-bullet-stellar-superconduct",
          snapshotChecks: [
            { expectedCoefficient: 0.216, talentLevel: 1 },
            { expectedCoefficient: 0.3888, talentLevel: 10 }
          ]
        }
      ],
      element: sandroneDefinition.element,
      evaluator: "declared_special_reaction",
      id: "sandrone.skill.phenomenon_calculus.prism_bullet.stellar_superconduct",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "prism-bullet-stellar-superconduct-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          defaultValue: 0,
          id: "stored-elemental-applications",
          label: "手填：当前窗口已储存元素附着次数（0–12次，非完整循环推导）",
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
    },
    {
      attackKind: "charged",
      characterId: "Sandrone",
      damageKind: "special_reaction",
      damageParts: [
        {
          coefficientParameterId: "condensation-ray-stellar-superconduct-damage",
          id: "condensation-ray-stellar-superconduct",
          snapshotChecks: [
            { expectedCoefficient: 0.817, talentLevel: 1 },
            { expectedCoefficient: 1.615, talentLevel: 10 }
          ]
        }
      ],
      element: sandroneDefinition.element,
      evaluator: "declared_special_reaction",
      id: "sandrone.normal.charged_attack.condensation_ray.stellar_superconduct",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "condensation-ray-stellar-superconduct-damage",
          parameterIndex: 5,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          defaultValue: 0,
          id: "stored-elemental-applications",
          label: "手填：当前极星辉域已储存元素附着次数（0–12次）",
          maximumValue: 12,
          minimumValue: 0
        }
      ],
      specialReaction: {
        kind: "stellar_superconduct",
        stellarStoredElementalApplicationsParameterId: "stored-elemental-applications"
      },
      status: "verified",
      talentSlot: "normal"
    },
    {
      characterId: "Sandrone",
      damageKind: "special_reaction",
      damageParts: [
        {
          id: "negative-temperature-beam-stellar-superconduct",
          scalingTerms: [
            {
              coefficientParameterId: "negative-temperature-beam-stellar-superconduct-damage",
              snapshotChecks: [
                { expectedCoefficient: 2.205333, talentLevel: 1 },
                { expectedCoefficient: 3.9696, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientMultiplierParameterId:
                "negative-temperature-beam-damage-increase-per-improved-tactics-stack",
              coefficientMultiplierScenarioParameterId: "improved-tactics-stacks",
              coefficientMultiplierSnapshotChecks: [
                { expectedCoefficient: 0.1, talentLevel: 1 },
                { expectedCoefficient: 0.1, talentLevel: 10 }
              ],
              coefficientParameterId: "negative-temperature-beam-stellar-superconduct-damage",
              snapshotChecks: [
                { expectedCoefficient: 2.205333, talentLevel: 1 },
                { expectedCoefficient: 3.9696, talentLevel: 10 }
              ],
              stat: "attack"
            }
          ]
        }
      ],
      element: sandroneDefinition.element,
      evaluator: "declared_special_reaction",
      id: "sandrone.burst.phenomenon_calculus.negative_temperature_beam.stellar_superconduct",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "negative-temperature-beam-stellar-superconduct-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "passive1",
          id: "negative-temperature-beam-damage-increase-per-improved-tactics-stack",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scenarioParameters: [
        {
          defaultValue: 0,
          id: "stored-elemental-applications",
          label: "手填：当前极星辉域已储存元素附着次数（0–12次）",
          maximumValue: 12,
          minimumValue: 0
        },
        {
          defaultValue: 10,
          id: "improved-tactics-stacks",
          label: "悠久的演算机关 · 改进战术层数",
          maximumValue: 10,
          minimumValue: 0
        }
      ],
      specialReaction: {
        kind: "stellar_superconduct",
        stellarStoredElementalApplicationsParameterId: "stored-elemental-applications"
      },
      status: "verified",
      talentSlot: "burst"
    },
    {
      attackKind: "charged",
      characterId: "Sandrone",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "prism-bullet-damage",
          id: "condensed-cluster-beam-ordinary",
          snapshotChecks: [
            { expectedCoefficient: 0.324, talentLevel: 1 },
            { expectedCoefficient: 0.5832, talentLevel: 10 }
          ]
        }
      ],
      element: sandroneDefinition.element,
      evaluator: "declared_direct",
      id: sandroneC6ClusterBeamActionIds.ordinary,
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "prism-bullet-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-condensed-cluster-beam-ready",
          label: "C6 水仙梦醒，且望晨光：第三次冷凝射线触发凝聚集束炮",
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
              parameterId: "c6-condensed-cluster-beam-ready",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 0, parameterValue: 1 }
              ]
            },
            damagePartId: "condensed-cluster-beam-ordinary",
            hitCount: 4,
            id: "condensed-cluster-beam-ordinary-four-hits",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      attackKind: "charged",
      characterId: "Sandrone",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "prism-bullet-stellar-superconduct-damage",
          id: "condensed-cluster-beam-stellar-superconduct",
          snapshotChecks: [
            { expectedCoefficient: 0.216, talentLevel: 1 },
            { expectedCoefficient: 0.3888, talentLevel: 10 }
          ]
        }
      ],
      element: sandroneDefinition.element,
      evaluator: "declared_direct",
      id: sandroneC6ClusterBeamActionIds.stellarSuperconduct,
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "prism-bullet-stellar-superconduct-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-condensed-cluster-beam-ready",
          label: "C6 水仙梦醒，且望晨光：第三次冷凝射线触发星超导凝聚集束炮",
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
              parameterId: "c6-condensed-cluster-beam-ready",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 0, parameterValue: 1 }
              ]
            },
            damagePartId: "condensed-cluster-beam-stellar-superconduct",
            hitCount: 4,
            id: "condensed-cluster-beam-stellar-superconduct-four-hits",
            snapshot: "hit",
            specialReaction: {
              kind: "stellar_superconduct",
              stellarStoredElementalApplicationsParameterId: "stored-elemental-applications"
            }
          }
        ],
        duration: 1
      }
    },
    {
      attackKind: "charged",
      characterId: "Sandrone",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "prism-bullet-stellar-superconduct-damage",
          id: "condensed-cluster-beam-stellar-swirl",
          snapshotChecks: [
            { expectedCoefficient: 0.216, talentLevel: 1 },
            { expectedCoefficient: 0.3888, talentLevel: 10 }
          ]
        }
      ],
      element: sandroneDefinition.element,
      evaluator: "declared_direct",
      id: sandroneC6ClusterBeamActionIds.stellarSwirl,
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "prism-bullet-stellar-superconduct-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-condensed-cluster-beam-ready",
          label: "C6 水仙梦醒，且望晨光：第三次冷凝射线触发星扩散凝聚集束炮",
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
              parameterId: "c6-condensed-cluster-beam-ready",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 0, parameterValue: 1 }
              ]
            },
            damagePartId: "condensed-cluster-beam-stellar-swirl",
            hitCount: 4,
            id: "condensed-cluster-beam-stellar-swirl-four-hits",
            snapshot: "hit",
            specialReaction: { kind: "stellar_swirl" }
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "sandrone.passive.a_ladys_guide_to_conduct.elemental_mastery",
      label: "淑女的行事准则 · 攻击力的8%转为自身元素精通（至多160点）",
      source: { characterId: "Sandrone", kind: "character", minimumSourceAscension: 4 },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "source" },
      value: {
        kind: "source_final_attack",
        maximumValue: {
          kind: "talent_parameter",
          parameter: {
            groupId: "passive2",
            id: "attack-to-elemental-mastery-maximum",
            parameterIndex: 1,
            source: "talent",
            talentSlot: "passive"
          }
        },
        multiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "passive2",
            id: "attack-to-elemental-mastery-ratio",
            parameterIndex: 0,
            source: "talent",
            talentSlot: "passive"
          }
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "sandrone.constellation.1.decoding.stellar_reaction_damage_bonus",
      label: "鎏金未凋，夕暮已远 · C1 解算模式下队伍星烁反应伤害提升30%",
      source: { characterId: "Sandrone", kind: "character", minimumSourceConstellation: 1 },
      target: "specialReactionDamageBonus",
      targetFilter: { specialReactionKinds: ["stellar_superconduct", "stellar_swirl"] },
      value: { kind: "fixed", value: 0.3 }
    },
    {
      activation: "maximum_reachable",
      id: "sandrone.constellation.2.condensation_ray.crit_damage",
      label: "回望镜中，时岁翩然 · C2 辉映冷凝射线暴击伤害提升40%",
      source: { characterId: "Sandrone", kind: "character", minimumSourceConstellation: 2 },
      target: "critDamage",
      targetFilter: {
        actionIds: ["sandrone.normal.charged_attack.condensation_ray.stellar_superconduct"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.4 }
    },
    {
      activation: "maximum_reachable",
      id: "sandrone.constellation.2.condensation_ray.maximum_stacks.crit_damage",
      label: "回望镜中，时岁翩然 · C2 冷凝射线满3层额外暴击伤害（20%×3）",
      source: { characterId: "Sandrone", kind: "character", minimumSourceConstellation: 2 },
      target: "critDamage",
      targetFilter: {
        actionIds: ["sandrone.normal.charged_attack.condensation_ray.stellar_superconduct"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.2 * 3 }
    },
    {
      activation: "maximum_reachable",
      id: "sandrone.constellation.6.narcissus_awaking.condensed_cluster_beam.ordinary_damage",
      label: "水仙梦醒，且望晨光 · C6 凝聚集束炮普通分支（每段100%攻击力）",
      source: { characterId: "Sandrone", kind: "character", minimumSourceConstellation: 6 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: { actionIds: [sandroneC6ClusterBeamActionIds.ordinary], recipientSourceRelation: "source" },
      value: {
        coefficient: { kind: "fixed", value: 1 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "attack"
      }
    },
    {
      activation: "maximum_reachable",
      id: "sandrone.constellation.6.narcissus_awaking.condensed_cluster_beam.stellar_superconduct_damage",
      label: "水仙梦醒，且望晨光 · C6 凝聚集束炮星超导分支（每段80%攻击力）",
      source: { characterId: "Sandrone", kind: "character", minimumSourceConstellation: 6 },
      target: "specialReactionBaseDamageFlat",
      targetFilter: {
        actionIds: [sandroneC6ClusterBeamActionIds.stellarSuperconduct],
        recipientSourceRelation: "source",
        specialReactionKinds: ["stellar_superconduct"]
      },
      value: { kind: "source_final_attack", multiplier: { kind: "fixed", value: 0.8 } }
    },
    {
      activation: "maximum_reachable",
      id: "sandrone.constellation.6.narcissus_awaking.condensed_cluster_beam.stellar_swirl_damage",
      label: "水仙梦醒，且望晨光 · C6 凝聚集束炮星扩散分支（每段120%攻击力）",
      source: { characterId: "Sandrone", kind: "character", minimumSourceConstellation: 6 },
      target: "specialReactionBaseDamageFlat",
      targetFilter: {
        actionIds: [sandroneC6ClusterBeamActionIds.stellarSwirl],
        recipientSourceRelation: "source",
        specialReactionKinds: ["stellar_swirl"]
      },
      value: { kind: "source_final_attack", multiplier: { kind: "fixed", value: 1.2 } }
    },
    {
      activation: "maximum_reachable",
      id: "sandrone.passive.stellar_superconduct_base_damage_bonus",
      label: "星耀祝礼·唯理为光 · 星超导／星扩散基础伤害加成",
      source: { characterId: "Sandrone", kind: "character" },
      target: "specialReactionBaseDamageBonus",
      targetFilter: { specialReactionKinds: ["stellar_superconduct", "stellar_swirl"] },
      value: {
        kind: "source_final_attack",
        maximumValue: {
          kind: "talent_parameter",
          parameter: {
            groupId: "passive3",
            id: "stellar-superconduct-base-damage-bonus-maximum",
            parameterIndex: 1,
            source: "talent",
            talentSlot: "passive"
          }
        },
        multiplier: {
          kind: "talent_parameter",
          multiplier: 0.01,
          parameter: {
            groupId: "passive3",
            id: "stellar-superconduct-base-damage-bonus-per-100-attack",
            parameterIndex: 0,
            source: "talent",
            talentSlot: "passive"
          }
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "sandrone.constellation.6.narcissus_awaking.stellar_reaction_elevation",
      label: "水仙梦醒，且望晨光 · C6 桑多涅造成的所有星烁反应伤害擢升20%",
      source: { characterId: "Sandrone", kind: "character", minimumSourceConstellation: 6 },
      target: "specialReactionElevation",
      targetFilter: {
        recipientSourceRelation: "source",
        specialReactionKinds: ["stellar_superconduct", "stellar_swirl"]
      },
      value: { kind: "fixed", value: 0.2 }
    }
  ],
  characterId: "Sandrone",
  metrics: [
    {
      actionId: sandroneC6ClusterBeamActionIds.ordinary,
      characterId: "Sandrone",
      id: sandroneC6ClusterBeamActionIds.ordinary,
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "水仙梦醒，且望晨光 / C6 凝聚集束炮普通分支四段总伤害",
      sourceActionId: sandroneC6ClusterBeamActionIds.ordinary,
      status: "verified",
      target: "enemy"
    },
    {
      actionId: sandroneC6ClusterBeamActionIds.stellarSuperconduct,
      characterId: "Sandrone",
      id: sandroneC6ClusterBeamActionIds.stellarSuperconduct,
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "水仙梦醒，且望晨光 / C6 凝聚集束炮星超导分支四段总伤害",
      sourceActionId: sandroneC6ClusterBeamActionIds.stellarSuperconduct,
      status: "verified",
      target: "enemy"
    },
    {
      actionId: sandroneC6ClusterBeamActionIds.stellarSwirl,
      characterId: "Sandrone",
      id: sandroneC6ClusterBeamActionIds.stellarSwirl,
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "水仙梦醒，且望晨光 / C6 凝聚集束炮星扩散分支四段总伤害",
      sourceActionId: sandroneC6ClusterBeamActionIds.stellarSwirl,
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "sandrone.normal.charged_attack.condensation_ray.stellar_superconduct",
      characterId: "Sandrone",
      id: "sandrone.normal.charged_attack.condensation_ray.stellar_superconduct",
      kind: "damage",
      label: "自明演绎 / 重击冷凝射线星超导单次命中",
      sourceActionId: "sandrone.normal.charged_attack.condensation_ray.stellar_superconduct",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "sandrone.burst.phenomenon_calculus.negative_temperature_beam.stellar_superconduct",
      characterId: "Sandrone",
      id: "sandrone.burst.phenomenon_calculus.negative_temperature_beam.stellar_superconduct",
      kind: "damage",
      label: "事象数式·万理证毕 / 负温聚能光束星超导单次命中",
      sourceActionId: "sandrone.burst.phenomenon_calculus.negative_temperature_beam.stellar_superconduct",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The maintained metrics are one charged Condensation Ray Stellar-Superconduct hit, one Burst Negative-Temperature Beam Stellar-Superconduct hit, and all three C6 Condensed Cluster Beam branches. Stellar-Superconduct metrics read the manual 0–12 stored-application snapshot. The Burst defaults to ten Improved Tactics stacks and applies the pinned 10% multiplier per stack. A4 converts 8% of Sandrone's resolved Attack into self-owned Elemental Mastery, capped at 160. C1 adds 30% party Stellar reaction damage; C2 adds 40% plus three 20% Crit DMG stacks only to the Condensation Ray, not to Burst or the separate C6 additional hits. Sandrone's final-Attack-derived, capped 14% Stellar-Superconduct base-damage bonus applies to eligible party actions. At C6, the third Condensation Ray adds four 100%-Attack ordinary Cryo hits, four 80%-Attack Stellar-Superconduct hits, or four 120%-Attack Stellar-Swirl hits according to the beam's damage branch; the Stellar branches also receive Sandrone's automatic 20% elevation. Per the single-hit metric scope, C4's independently timed coordinated attack is not merged into the ray. Prism bullets and one normal hit remain registered as lower-level actions; bombardment, timing, and rotations remain unmodeled.",
  label: sandroneDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "normal", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
