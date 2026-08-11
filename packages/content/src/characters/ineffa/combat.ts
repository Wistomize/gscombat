import type { CharacterCombatCoverage } from "../../combat/types.js"

import { ineffaDefinition } from "./definition.js"

export const ineffaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Ineffa",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.348352, talentLevel: 1 },
            { expectedCoefficient: 0.688602, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "ineffa.normal.auto.first_hit",
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
      characterId: "Ineffa",
      damageKind: "special_reaction",
      damageParts: [
        {
          coefficientParameterId: "frequency-overlimit-circuit-additional-lunar-charged-damage",
          id: "frequency-overlimit-circuit-additional-lunar-charged",
          snapshotChecks: [{ expectedCoefficient: 0.65, talentLevel: 1 }]
        }
      ],
      element: ineffaDefinition.element,
      evaluator: "declared_special_reaction",
      id: "ineffa.passive.frequency_overlimit_circuit.additional_lunar_charged",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "passive1",
          id: "frequency-overlimit-circuit-additional-lunar-charged-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      specialReaction: { kind: "lunar_charged" },
      status: "verified",
      talentSlot: "passive"
    },
    {
      characterId: "Ineffa",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "cleaning-mode-carrier-frequency-skill-damage",
          id: "cleaning-mode-carrier-frequency-skill-damage",
          snapshotChecks: [
            { expectedCoefficient: 0.864, talentLevel: 1 },
            { expectedCoefficient: 1.5552, talentLevel: 10 }
          ]
        }
      ],
      element: ineffaDefinition.element,
      evaluator: "declared_direct",
      id: "ineffa.skill.cleaning_mode_carrier_frequency.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "cleaning-mode-carrier-frequency-skill-damage",
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
      characterId: "Ineffa",
      element: ineffaDefinition.element,
      id: "ineffa.skill.cleaning_mode_carrier_frequency.optical_flow_shield",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "optical-flow-shield-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "optical-flow-shield-flat-absorption",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Ineffa",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "supreme-instruction-cyclonic-exterminator-initial-hit-damage",
          id: "supreme-instruction-cyclonic-exterminator-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 6.768, talentLevel: 1 },
            { expectedCoefficient: 12.1824, talentLevel: 10 }
          ]
        }
      ],
      element: ineffaDefinition.element,
      evaluator: "declared_direct",
      id: "ineffa.burst.supreme_instruction_cyclonic_exterminator.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "supreme-instruction-cyclonic-exterminator-initial-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "ineffa.passive.moonsign_benediction.lunar_charged_base_damage_bonus",
      label: "月兆祝赐·象拟中继 · 月感电基础伤害加成",
      source: { characterId: "Ineffa", kind: "character" },
      target: "specialReactionBaseDamageBonus",
      targetFilter: { specialReactionKinds: ["lunar_charged"] },
      value: {
        kind: "source_final_attack",
        maximumValue: {
          kind: "talent_parameter",
          parameter: {
            groupId: "passive3",
            id: "lunar-charged-base-damage-bonus-maximum",
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
            id: "lunar-charged-base-damage-bonus-per-100-attack",
            parameterIndex: 0,
            source: "talent",
            talentSlot: "passive"
          }
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "ineffa.passive.total_phase_reconfiguration_protocol.elemental_mastery",
      label: "全相重构协议 · 施放元素爆发后按伊涅芙攻击力的6%提升元素精通",
      source: { characterId: "Ineffa", kind: "character", minimumSourceAscension: 4 },
      target: "elementalMastery",
      value: {
        kind: "source_final_attack",
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
      id: "ineffa.constellation.1.lunar_charged_damage_bonus",
      label: "循环整流引擎 · C1展开光流屏障后全队月感电反应伤害提升",
      source: { characterId: "Ineffa", kind: "character", minimumSourceConstellation: 1 },
      target: "specialReactionDamageBonus",
      targetFilter: { specialReactionKinds: ["lunar_charged"] },
      value: {
        kind: "source_final_attack",
        maximumValue: { kind: "fixed", value: 0.5 },
        multiplier: { kind: "fixed", value: 0.00025 }
      }
    }
  ],
  characterId: "Ineffa",
  metrics: [
    {
      actionId: "ineffa.passive.frequency_overlimit_circuit.additional_lunar_charged",
      characterId: "Ineffa",
      id: "ineffa.passive.frequency_overlimit_circuit.additional_lunar_charged",
      kind: "damage",
      label: "频率超限回路 / 薇尔琪塔额外月感电伤害",
      sourceActionId: "ineffa.passive.frequency_overlimit_circuit.additional_lunar_charged",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "ineffa.skill.cleaning_mode_carrier_frequency.initial_hit",
      characterId: "Ineffa",
      id: "ineffa.skill.cleaning_mode_carrier_frequency.initial_hit",
      kind: "damage",
      label: "涤净模式·稳态载频 / 释放雷元素伤害",
      sourceActionId: "ineffa.skill.cleaning_mode_carrier_frequency.initial_hit",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "ineffa.burst.supreme_instruction_cyclonic_exterminator.initial_hit",
      characterId: "Ineffa",
      id: "ineffa.burst.supreme_instruction_cyclonic_exterminator.initial_hit",
      kind: "damage",
      label: "至高律令·全域扫灭 / 释放雷元素伤害",
      sourceActionId: "ineffa.burst.supreme_instruction_cyclonic_exterminator.initial_hit",
      status: "verified",
      target: "enemy"
    },
    {
      characterId: "Ineffa",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "optical-flow-shield-flat-absorption",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 1386.6759, talentLevel: 1 },
          { expectedValue: 3050.9182, talentLevel: 10 }
        ]
      },
      id: "ineffa.skill.cleaning_mode_carrier_frequency.optical_flow_shield.initial_absorption",
      kind: "scalar",
      label: "净化模式·载波频率 / 光流护盾基础吸收量",
      ratioParameter: {
        reference: {
          groupId: "skill",
          id: "optical-flow-shield-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 2.21184, talentLevel: 1 },
          { expectedValue: 3.981312, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "attack",
      semantic: "shield",
      sourceActionId: "ineffa.skill.cleaning_mode_carrier_frequency.optical_flow_shield",
      status: "verified",
      target: "friendly_recipient",
      unit: "hp"
    }
  ],
  detail:
    "The primary metric is Frequency Overlimit Circuit's separate 65% final-Attack Lunar-Charged hit after Birgitta's nearby Thundercloud trigger has been fulfilled. It uses the dedicated Lunar-Charged coefficient and excludes ordinary damage bonus and defense. Ineffa's capped final-Attack-derived 14% base-damage bonus is team-wide; after Burst, A4 adds 6% of Ineffa's final Attack as Elemental Mastery to Ineffa and the evaluated active character. C1's reachable post-shield state adds up to 50% team Lunar-Charged reaction damage bonus. C2's separate 300% Attack and C6's separate 135% Attack Lunar-Charged events are deliberately not merged into the 65% passive action. The Skill and Burst release hits remain selectable ordinary Electro metrics. Optical Flow Shield remains a selectable support metric calculated as final Attack times skill[1] plus skill[2], before recipient Shield Strength; C3 raises Skill levels and C5 raises Burst levels. Thundercloud creation, trigger cadence, duration, energy, and rotations are not inferred.",
  label: ineffaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
