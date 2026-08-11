import type { CharacterCombatCoverage } from "../../combat/types.js"

import { zibaiDefinition } from "./definition.js"

export const zibaiCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Zibai",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.505542, talentLevel: 1 },
            { expectedCoefficient: 0.999328, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "zibai.normal.auto.first_hit",
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
      characterId: "Zibai",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "tri-sphere-eminence-first-hit-damage",
          id: "tri-sphere-eminence-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.2696, talentLevel: 1 },
            { expectedCoefficient: 2.28528, talentLevel: 10 }
          ]
        }
      ],
      element: zibaiDefinition.element,
      evaluator: "declared_direct",
      id: "zibai.burst.tri_sphere_eminence.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "tri-sphere-eminence-first-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "defense",
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Zibai",
      damageKind: "special_reaction",
      damageParts: [
        {
          coefficientParameterId: "tri-sphere-eminence-second-hit-lunar-crystallize-damage",
          id: "tri-sphere-eminence-second-hit-lunar-crystallize",
          snapshotChecks: [
            { expectedCoefficient: 1.77744, talentLevel: 1 },
            { expectedCoefficient: 3.199392, talentLevel: 10 }
          ]
        }
      ],
      element: zibaiDefinition.element,
      evaluator: "declared_special_reaction",
      id: "zibai.burst.tri_sphere_eminence.second_hit.lunar_crystallize",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "tri-sphere-eminence-second-hit-lunar-crystallize-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "defense",
      specialReaction: { kind: "lunar_crystallize" },
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Zibai",
      damageKind: "special_reaction",
      damageParts: [
        {
          coefficientParameterId: "spirit-steed-stride-second-hit-lunar-crystallize-damage",
          id: "spirit-steed-stride-second-hit-lunar-crystallize",
          snapshotChecks: [
            { expectedCoefficient: 1.40968, talentLevel: 1 },
            { expectedCoefficient: 2.537424, talentLevel: 10 }
          ]
        }
      ],
      element: zibaiDefinition.element,
      evaluator: "declared_special_reaction",
      id: "zibai.skill.spirit_steed_stride.second_hit.lunar_crystallize",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "spirit-steed-stride-second-hit-lunar-crystallize-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "defense",
      specialReaction: { kind: "lunar_crystallize" },
      status: "verified",
      talentSlot: "skill"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      condition: { kind: "primary_same_element_teammate_count", minimum: 1 },
      id: "zibai.passive.other_geo.defense_percent.stack_1",
      label: "叠嶂峦岫出云 · 第1名其他岩元素角色（防御力提高15%）",
      source: { characterId: "Zibai", kind: "character", minimumSourceAscension: 4 },
      target: "defensePercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "passive2",
          id: "defense-percent-per-other-geo-character",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "primary_same_element_teammate_count", minimum: 2 },
      id: "zibai.passive.other_geo.defense_percent.stack_2",
      label: "叠嶂峦岫出云 · 第2名其他岩元素角色（防御力提高15%）",
      source: { characterId: "Zibai", kind: "character", minimumSourceAscension: 4 },
      target: "defensePercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "passive2",
          id: "defense-percent-per-other-geo-character",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "primary_same_element_teammate_count", minimum: 3 },
      id: "zibai.passive.other_geo.defense_percent.stack_3",
      label: "叠嶂峦岫出云 · 第3名其他岩元素角色（防御力提高15%）",
      source: { characterId: "Zibai", kind: "character", minimumSourceAscension: 4 },
      target: "defensePercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "passive2",
          id: "defense-percent-per-other-geo-character",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      }
    },
    ...[1, 2, 3].map((stack) => ({
      activation: "maximum_reachable" as const,
      condition: { elements: ["hydro" as const], kind: "team_element_count" as const, minimum: stack },
      id: `zibai.passive.hydro_teammate.elemental_mastery.stack_${stack}`,
      label: `叠嶂峦岫出云 · 第${stack}名水元素角色（元素精通提高60点）`,
      source: { characterId: "Zibai", kind: "character" as const, minimumSourceAscension: 4 },
      target: "elementalMastery" as const,
      targetFilter: { recipientSourceRelation: "source" as const },
      value: {
        kind: "talent_parameter" as const,
        parameter: {
          groupId: "passive2" as const,
          id: "elemental-mastery-per-hydro-character",
          parameterIndex: 1,
          source: "talent" as const,
          talentSlot: "passive" as const
        }
      }
    })),
    {
      activation: "maximum_reachable",
      id: "zibai.passive.lunar_crystallize_base_damage_bonus",
      label: "月兆祝赐·浮明若流 · 月结晶基础伤害加成",
      source: { characterId: "Zibai", kind: "character" },
      target: "specialReactionBaseDamageBonus",
      targetFilter: { specialReactionKinds: ["lunar_crystallize"] },
      value: {
        kind: "source_final_defense",
        maximumValue: {
          kind: "talent_parameter",
          parameter: {
            groupId: "passive3",
            id: "lunar-crystallize-base-damage-bonus-maximum",
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
            id: "lunar-crystallize-base-damage-bonus-per-100-defense",
            parameterIndex: 0,
            source: "talent",
            talentSlot: "passive"
          }
        },
        sourceDefenseSnapshotEffectIds: [
          "zibai.passive.other_geo.defense_percent.stack_1",
          "zibai.passive.other_geo.defense_percent.stack_2",
          "zibai.passive.other_geo.defense_percent.stack_3",
          "illuga.constellation.4.active_character.defense"
        ]
      }
    },
    {
      activation: "maximum_reachable",
      id: "zibai.passive.selenic_descent.spirit_steed_second_hit.base_damage",
      label: "月下素娥降仙 · 太阴降（灵驹飞踏第二段伤害增加值为60%防御力）",
      source: { characterId: "Zibai", kind: "character", minimumSourceAscension: 1 },
      target: "specialReactionFlatDamageAddition",
      targetFilter: {
        actionIds: ["zibai.skill.spirit_steed_stride.second_hit.lunar_crystallize"],
        recipientSourceRelation: "source",
        specialReactionKinds: ["lunar_crystallize"]
      },
      value: {
        kind: "source_final_defense",
        multiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "passive1",
            id: "spirit-steed-second-hit-defense-addition",
            parameterIndex: 0,
            source: "talent",
            talentSlot: "passive"
          }
        },
        sourceDefenseSnapshotEffectIds: [
          "zibai.passive.other_geo.defense_percent.stack_1",
          "zibai.passive.other_geo.defense_percent.stack_2",
          "zibai.passive.other_geo.defense_percent.stack_3",
          "illuga.constellation.4.active_character.defense"
        ]
      }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
      id: "zibai.constellation.2.full_moonsign.spirit_steed_second_hit.base_damage",
      label: "化于生而死于尸 · C2 满辉太阴降（灵驹飞踏第二段伤害额外增加值为550%防御力）",
      source: { characterId: "Zibai", kind: "character", minimumSourceConstellation: 2 },
      target: "specialReactionFlatDamageAddition",
      targetFilter: {
        actionIds: ["zibai.skill.spirit_steed_stride.second_hit.lunar_crystallize"],
        recipientSourceRelation: "source",
        specialReactionKinds: ["lunar_crystallize"]
      },
      value: {
        kind: "source_final_defense",
        multiplier: { kind: "fixed", value: 5.5 },
        sourceDefenseSnapshotEffectIds: [
          "zibai.passive.other_geo.defense_percent.stack_1",
          "zibai.passive.other_geo.defense_percent.stack_2",
          "zibai.passive.other_geo.defense_percent.stack_3",
          "illuga.constellation.4.active_character.defense"
        ]
      }
    },
    {
      activation: "maximum_reachable",
      id: "zibai.constellation.1.first_spirit_steed_stride.lunar_crystallize_damage_bonus",
      label: "出勃然而入寥然 · C1 每次月转时隙首次灵驹飞踏第二段月结晶反应伤害提升220%",
      source: { characterId: "Zibai", kind: "character", minimumSourceConstellation: 1 },
      target: "specialReactionDamageBonus",
      targetFilter: {
        actionIds: ["zibai.skill.spirit_steed_stride.second_hit.lunar_crystallize"],
        recipientSourceRelation: "source",
        specialReactionKinds: ["lunar_crystallize"]
      },
      value: { kind: "fixed", value: 2.2 }
    },
    {
      activation: "maximum_reachable",
      id: "zibai.constellation.2.lunar_phase_shift.lunar_crystallize_damage_bonus",
      label: "化于生而死于尸 · C2 月转时隙期间月结晶反应伤害提升30%",
      source: { characterId: "Zibai", kind: "character", minimumSourceConstellation: 2 },
      target: "specialReactionDamageBonus",
      targetFilter: { recipientSourceRelation: "source", specialReactionKinds: ["lunar_crystallize"] },
      value: { kind: "fixed", value: 0.3 }
    },
    {
      activation: "maximum_reachable",
      id: "zibai.constellation.6.maximum_time_gap.lunar_crystallize_elevation",
      label: "天地忽如一远行 · C6 消耗100点时隙浮光（月结晶反应伤害擢升48%）",
      source: { characterId: "Zibai", kind: "character", minimumSourceConstellation: 6 },
      target: "specialReactionElevation",
      targetFilter: { recipientSourceRelation: "source", specialReactionKinds: ["lunar_crystallize"] },
      value: { kind: "fixed", value: 0.48 }
    }
  ],
  characterId: "Zibai",
  metrics: [
    {
      actionId: "zibai.skill.spirit_steed_stride.second_hit.lunar_crystallize",
      characterId: "Zibai",
      id: "zibai.skill.spirit_steed_stride.second_hit.lunar_crystallize",
      kind: "damage",
      label: "天地忽然身 / 灵驹飞踏第二段月结晶单次命中",
      sourceActionId: "zibai.skill.spirit_steed_stride.second_hit.lunar_crystallize",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "zibai.burst.tri_sphere_eminence.first_hit",
      characterId: "Zibai",
      id: "zibai.burst.tri_sphere_eminence.first_hit",
      kind: "damage",
      label: "三垣威仪法 / 第一段岩元素单次命中",
      sourceActionId: "zibai.burst.tri_sphere_eminence.first_hit",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "zibai.burst.tri_sphere_eminence.second_hit.lunar_crystallize",
      characterId: "Zibai",
      id: "zibai.burst.tri_sphere_eminence.second_hit.lunar_crystallize",
      kind: "damage",
      label: "三垣威仪法 / 第二段月结晶单次命中",
      sourceActionId: "zibai.burst.tri_sphere_eminence.second_hit.lunar_crystallize",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The primary metric is Spirit Steed's Stride second-hit Lunar-Crystallize damage. It uses the generated skill parameter at index 1, while Selenic Descent's 60% DEF and C2 Full-Moonsign's 550% DEF are fixed additions after the Lunar reaction-bonus stage and before CRIT. It also includes Zibai's Geo/Hydro teammate stat passive, her capped 14% Lunar-Crystallize base-damage bonus, C1's first-use 220% and C2's 30% reaction-damage bonuses, and C6's maximum 48% elevation snapshot. Tri-Sphere Eminence's direct first hit and Lunar-Crystallize second hit remain selectable secondary metrics. C4's later fourth-normal hit, timing, and rotations remain unmodeled.",
  label: zibaiDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
