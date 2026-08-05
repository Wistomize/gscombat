import type { CharacterCombatCoverage } from "../../combat/types.js"

import { sandroneDefinition } from "./definition.js"

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
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "sandrone.passive.stellar_superconduct_base_damage_bonus",
      label: "星耀祝礼·唯理为光 · 星超导基础伤害加成",
      source: { characterId: "Sandrone", kind: "character" },
      target: "specialReactionBaseDamageBonus",
      targetFilter: { specialReactionKinds: ["stellar_superconduct"] },
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
    }
  ],
  characterId: "Sandrone",
  metrics: [
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
    "The maintained metrics are one charged Condensation Ray Stellar-Superconduct hit and one Burst Negative-Temperature Beam Stellar-Superconduct hit. Both read the manual 0–12 stored-application snapshot. The Burst defaults to ten Improved Tactics stacks and applies the pinned 10% multiplier per stack. Sandrone's final-Attack-derived, capped 14% Stellar-Superconduct base-damage bonus applies to eligible party actions. Prism bullets and one normal hit remain registered as lower-level actions; bombardment, other passives, constellations, timing, and rotations remain unmodeled.",
  label: sandroneDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "normal", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
