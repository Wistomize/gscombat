import type { CharacterCombatCoverage } from "../../combat/types.js"

import { linneaDefinition } from "./definition.js"

const linneaSkillActionIds = {
  enhancedHammer: "linnea.skill.lumi.enhanced_hammer.lunar_crystallize",
  millionTonHammer: "linnea.skill.lumi.million_ton_hammer.lunar_crystallize"
} as const

const linneaConstellation4DefenseEffectIds = {
  activeLinnea: "linnea.constellation.4.lunar_cage_chord.active_linnea.defense_percent",
  linnea: "linnea.constellation.4.lunar_cage_chord.linnea.defense_percent"
} as const

const linneaConstellation4DefenseSnapshotEffectIds = Object.values(linneaConstellation4DefenseEffectIds)

export const linneaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Linnea",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.589969, talentLevel: 1 },
            { expectedCoefficient: 1.166217, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "linnea.normal.auto.first_hit",
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
      characterId: "Linnea",
      damageKind: "special_reaction",
      damageParts: [
        {
          coefficientParameterId: "lumi-enhanced-hammer-lunar-crystallize-damage",
          id: "lumi-enhanced-hammer-lunar-crystallize",
          snapshotChecks: [
            { expectedCoefficient: 1, talentLevel: 1 },
            { expectedCoefficient: 1.8, talentLevel: 10 }
          ]
        }
      ],
      element: linneaDefinition.element,
      evaluator: "declared_special_reaction",
      id: linneaSkillActionIds.enhancedHammer,
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "lumi-enhanced-hammer-lunar-crystallize-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "defense",
      specialReaction: { kind: "lunar_crystallize" },
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Linnea",
      damageKind: "special_reaction",
      damageParts: [
        {
          coefficientParameterId: "lumi-million-ton-hammer-lunar-crystallize-damage",
          id: "lumi-million-ton-hammer-lunar-crystallize",
          snapshotChecks: [
            { expectedCoefficient: 4, talentLevel: 1 },
            { expectedCoefficient: 7.2, talentLevel: 10 }
          ]
        }
      ],
      element: linneaDefinition.element,
      evaluator: "declared_special_reaction",
      id: linneaSkillActionIds.millionTonHammer,
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "lumi-million-ton-hammer-lunar-crystallize-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "defense",
      specialReaction: { kind: "lunar_crystallize" },
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Linnea",
      element: linneaDefinition.element,
      id: "linnea.burst.desperate_survival_guide.healing",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "initial-healing-flat",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "initial-healing-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "continuous-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "continuous-healing-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Linnea",
      element: linneaDefinition.element,
      id: "linnea.passive.field_observation_notes",
      kind: "support",
      status: "verified",
      talentSlot: "passive"
    },
    {
      characterId: "Linnea",
      element: linneaDefinition.element,
      id: "linnea.passive.adventure_is_all_about_courage",
      kind: "support",
      parameterReferences: [
        {
          groupId: "passive2",
          id: "defense-to-elemental-mastery-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "passive"
    },
    {
      characterId: "Linnea",
      element: linneaDefinition.element,
      id: "linnea.passive.moonsign_blessing.habitat_survey",
      kind: "support",
      parameterReferences: [
        {
          groupId: "passive3",
          id: "lunar-crystallize-base-damage-bonus-per-defense",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive3",
          id: "lunar-crystallize-base-damage-bonus-maximum",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "passive"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "linnea.passive.geo_resistance_reduction.base",
      label: "野外观察手记 · 岩元素抗性降低",
      source: { characterId: "Linnea", kind: "character" },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["geo"] },
      value: { kind: "fixed", value: 0.15 }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
      id: "linnea.passive.geo_resistance_reduction.full_moonsign",
      label: "野外观察手记 · 满辉额外岩元素抗性降低",
      source: { characterId: "Linnea", kind: "character" },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["geo"] },
      value: { kind: "fixed", value: 0.15 }
    },
    {
      activation: "maximum_reachable",
      id: "linnea.passive.defense_to_elemental_mastery",
      label: "万类博物图鉴 · 当前角色元素精通提升",
      source: { characterId: "Linnea", kind: "character", minimumSourceAscension: 4 },
      target: "elementalMastery",
      targetFilter: { specialReactionKinds: ["lunar_bloom", "lunar_charged", "lunar_crystallize"] },
      value: {
        kind: "source_final_defense",
        multiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "passive2",
            id: "defense-to-elemental-mastery-ratio",
            parameterIndex: 0,
            source: "talent",
            talentSlot: "passive"
          }
        },
        sourceDefenseSnapshotEffectIds: linneaConstellation4DefenseSnapshotEffectIds
      }
    },
    {
      activation: "maximum_reachable",
      id: "linnea.passive.lunar_crystallize_base_damage_bonus",
      label: "月兆祝赐·栖地考察 · 月结晶基础伤害加成",
      source: { characterId: "Linnea", kind: "character" },
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
            id: "lunar-crystallize-base-damage-bonus-per-defense",
            parameterIndex: 0,
            source: "talent",
            talentSlot: "passive"
          }
        },
        sourceDefenseSnapshotEffectIds: linneaConstellation4DefenseSnapshotEffectIds
      }
    },
    {
      activation: "maximum_reachable",
      id: linneaConstellation4DefenseEffectIds.linnea,
      label: "专家的直感觉 · C4 月笼谐奏后莉奈娅防御力提高25%",
      source: { characterId: "Linnea", kind: "character", minimumSourceConstellation: 4 },
      target: "defensePercent",
      targetFilter: {
        recipientSourceRelation: "source",
        specialReactionKinds: ["lunar_crystallize"]
      },
      value: { kind: "fixed", value: 0.25 }
    },
    {
      activation: "maximum_reachable",
      id: linneaConstellation4DefenseEffectIds.activeLinnea,
      label: "专家的直感觉 · C4 莉奈娅站场时防御力额外提高25%",
      source: { characterId: "Linnea", kind: "character", minimumSourceConstellation: 4 },
      target: "defensePercent",
      targetFilter: {
        actionIds: [linneaSkillActionIds.millionTonHammer],
        recipientSourceRelation: "source",
        specialReactionKinds: ["lunar_crystallize"]
      },
      value: { kind: "fixed", value: 0.25 }
    },
    {
      activation: "maximum_reachable",
      id: "linnea.constellation.1.chronicle.party_lunar_crystallize.flat_damage_addition",
      label: "未完成的分类 · C1 队友月结晶消耗1层历览编录（75%莉奈娅防御力）",
      source: { characterId: "Linnea", kind: "character", minimumSourceConstellation: 1 },
      target: "specialReactionFlatDamageAddition",
      targetFilter: { recipientSourceRelation: "not_source", specialReactionKinds: ["lunar_crystallize"] },
      value: {
        kind: "source_final_defense",
        multiplier: { kind: "fixed", value: 0.75 },
        sourceDefenseSnapshotEffectIds: [linneaConstellation4DefenseEffectIds.linnea]
      }
    },
    {
      activation: "maximum_reachable",
      id: "linnea.constellation.1.chronicle.enhanced_hammer.flat_damage_addition",
      label: "未完成的分类 · C1 加力重锤消耗1层历览编录（75%莉奈娅防御力）",
      source: { characterId: "Linnea", kind: "character", minimumSourceConstellation: 1 },
      target: "specialReactionFlatDamageAddition",
      targetFilter: {
        actionIds: [linneaSkillActionIds.enhancedHammer],
        recipientSourceRelation: "source",
        specialReactionKinds: ["lunar_crystallize"]
      },
      value: {
        kind: "source_final_defense",
        multiplier: { kind: "fixed", value: 0.75 },
        sourceDefenseSnapshotEffectIds: [linneaConstellation4DefenseEffectIds.linnea]
      }
    },
    {
      activation: "maximum_reachable",
      id: "linnea.constellation.1.chronicle.million_ton_hammer.flat_damage_addition",
      label: "未完成的分类 · C1 百万吨重锤消耗5层历览编录（750%莉奈娅防御力）",
      source: { characterId: "Linnea", kind: "character", minimumSourceConstellation: 1 },
      target: "specialReactionFlatDamageAddition",
      targetFilter: {
        actionIds: [linneaSkillActionIds.millionTonHammer],
        recipientSourceRelation: "source",
        specialReactionKinds: ["lunar_crystallize"]
      },
      value: {
        kind: "source_final_defense",
        multiplier: { kind: "fixed", value: 7.5 },
        sourceDefenseSnapshotEffectIds: linneaConstellation4DefenseSnapshotEffectIds
      }
    },
    {
      activation: "maximum_reachable",
      id: "linnea.constellation.2.lunar_cage_chord.hydro_geo_crit_damage",
      label: "喜或悲的谕告 · C2 月笼谐奏后水元素与岩元素角色暴击伤害提高40%",
      source: { characterId: "Linnea", kind: "character", minimumSourceConstellation: 2 },
      target: "critDamage",
      targetFilter: { elements: ["hydro", "geo"] },
      value: { kind: "fixed", value: 0.4 }
    },
    {
      activation: "maximum_reachable",
      id: "linnea.constellation.2.million_ton_hammer.crit_damage",
      label: "喜或悲的谕告 · C2 百万吨重锤暴击伤害额外提高150%",
      source: { characterId: "Linnea", kind: "character", minimumSourceConstellation: 2 },
      target: "critDamage",
      targetFilter: {
        actionIds: [linneaSkillActionIds.millionTonHammer],
        elements: ["geo"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 1.5 }
    },
    {
      activation: "maximum_reachable",
      id: "linnea.constellation.6.chronicle.party_lunar_crystallize.extra_flat_damage_addition",
      label: "黄金猎犬之梦 · C6 队友历览编录伤害提升至原本150%（额外37.5%莉奈娅防御力）",
      source: { characterId: "Linnea", kind: "character", minimumSourceConstellation: 6 },
      target: "specialReactionFlatDamageAddition",
      targetFilter: { recipientSourceRelation: "not_source", specialReactionKinds: ["lunar_crystallize"] },
      value: {
        kind: "source_final_defense",
        multiplier: { kind: "fixed", value: 0.375 },
        sourceDefenseSnapshotEffectIds: [linneaConstellation4DefenseEffectIds.linnea]
      }
    },
    {
      activation: "maximum_reachable",
      id: "linnea.constellation.6.chronicle.enhanced_hammer.extra_flat_damage_addition",
      label: "黄金猎犬之梦 · C6 加力重锤历览编录额外提升（37.5%莉奈娅防御力）",
      source: { characterId: "Linnea", kind: "character", minimumSourceConstellation: 6 },
      target: "specialReactionFlatDamageAddition",
      targetFilter: {
        actionIds: [linneaSkillActionIds.enhancedHammer],
        recipientSourceRelation: "source",
        specialReactionKinds: ["lunar_crystallize"]
      },
      value: {
        kind: "source_final_defense",
        multiplier: { kind: "fixed", value: 0.375 },
        sourceDefenseSnapshotEffectIds: [linneaConstellation4DefenseEffectIds.linnea]
      }
    },
    {
      activation: "maximum_reachable",
      id: "linnea.constellation.6.chronicle.million_ton_hammer.extra_flat_damage_addition",
      label: "黄金猎犬之梦 · C6 百万吨重锤历览编录额外提升（375%莉奈娅防御力）",
      source: { characterId: "Linnea", kind: "character", minimumSourceConstellation: 6 },
      target: "specialReactionFlatDamageAddition",
      targetFilter: {
        actionIds: [linneaSkillActionIds.millionTonHammer],
        recipientSourceRelation: "source",
        specialReactionKinds: ["lunar_crystallize"]
      },
      value: {
        kind: "source_final_defense",
        multiplier: { kind: "fixed", value: 3.75 },
        sourceDefenseSnapshotEffectIds: linneaConstellation4DefenseSnapshotEffectIds
      }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
      id: "linnea.constellation.6.full_moonsign.lunar_crystallize_elevation",
      label: "黄金猎犬之梦 · C6 满辉月结晶反应伤害擢升25%",
      source: { characterId: "Linnea", kind: "character", minimumSourceConstellation: 6 },
      target: "specialReactionElevation",
      targetFilter: { specialReactionKinds: ["lunar_crystallize"] },
      value: { kind: "fixed", value: 0.25 }
    }
  ],
  characterId: "Linnea",
  metrics: [
    {
      characterId: "Linnea",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "initial-healing-flat",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 770.3755, talentLevel: 1 },
          { expectedValue: 1694.9546, talentLevel: 10 }
        ]
      },
      id: "linnea.burst.initial_team_healing",
      includeHealingBonus: true,
      kind: "healing",
      label: "绝境生存指南 / 首次单人治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "initial-healing-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 1.6, talentLevel: 1 },
          { expectedValue: 2.88, talentLevel: 10 }
        ]
      },
      recipientRequirements: [{ kind: "recipient_in_source_area", label: "受治疗角色位于露米附近" }],
      scalingStat: "defense",
      sourceActionId: "linnea.burst.desperate_survival_guide.healing",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      characterId: "Linnea",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "continuous-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 154.0751, talentLevel: 1 },
          { expectedValue: 338.9909, talentLevel: 10 }
        ]
      },
      id: "linnea.burst.continuous_healing_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "绝境生存指南 / 单次持续治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "continuous-healing-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.32, talentLevel: 1 },
          { expectedValue: 0.576, talentLevel: 10 }
        ]
      },
      recipientRequirements: [{ kind: "recipient_in_source_area", label: "当前场上角色位于露米附近" }],
      scalingStat: "defense",
      sourceActionId: "linnea.burst.desperate_survival_guide.healing",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      actionId: linneaSkillActionIds.enhancedHammer,
      characterId: "Linnea",
      id: linneaSkillActionIds.enhancedHammer,
      kind: "damage",
      label: "对策·露米呀吼吼！/ 点按·露米加力重锤单次月结晶伤害",
      sourceActionId: linneaSkillActionIds.enhancedHammer,
      status: "verified",
      target: "enemy"
    },
    {
      actionId: linneaSkillActionIds.millionTonHammer,
      characterId: "Linnea",
      id: linneaSkillActionIds.millionTonHammer,
      kind: "damage",
      label: "对策·露米呀吼吼！/ 连续点按·露米百万吨重锤月结晶爆发伤害",
      sourceActionId: linneaSkillActionIds.millionTonHammer,
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The selected profile keeps initial party healing and one continuous on-field healing tick, then exposes Lume's single-press Enhanced Hammer and consecutive-press Million-Ton Hammer as direct Lunar-Crystallize metrics. Both scale from final Defense through Moon's independent base coefficient, base-damage bonus, Elemental-Mastery and reaction-bonus stage, post-reaction fixed addition, CRIT, resistance, and elevation. The A4 Defense-to-Mastery allocation and capped 14% Lunar-Crystallize base-damage bonus remain automatic effects instead of standalone metrics. C1 Chronicle additions enter the post-reaction fixed-addition stage, C2 enters CRIT Damage, C4 enters final Defense, and Full-Moonsign C6 enters elevation. Ordinary damage bonus and defense multipliers do not apply; timing and rotations remain unmodeled.",
  label: linneaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
