import type { CharacterCombatCoverage } from "../../combat/types.js"

import { nicoleDefinition } from "./definition.js"

export const nicoleCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Nicole",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.351792, talentLevel: 1 },
            { expectedCoefficient: 0.633226, talentLevel: 10 }
          ]
        }
      ],
      element: nicoleDefinition.element,
      evaluator: "declared_direct",
      id: "nicole.normal.auto.first_hit",
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
      characterId: "Nicole",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "sacred-word-revelation-unseen-light-skill-damage",
          id: "sacred-word-revelation-unseen-light-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.384, talentLevel: 1 },
            { expectedCoefficient: 2.4912, talentLevel: 10 }
          ]
        }
      ],
      element: nicoleDefinition.element,
      evaluator: "declared_direct",
      id: "nicole.skill.sacred_word_revelation.unseen_light.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "sacred-word-revelation-unseen-light-skill-damage",
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
      characterId: "Nicole",
      element: nicoleDefinition.element,
      id: "nicole.skill.sacred_word_revelation.unseen_light.blazing_light_shield",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "shield-of-blazing-light-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "shield-of-blazing-light-flat-absorption",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Nicole",
      element: nicoleDefinition.element,
      id: "nicole.skill.sacred_word_revelation.unseen_light.grace_of_kenosis.attack_buff",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "grace-of-kenosis-attack-ratio",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "grace-of-kenosis-attack-bonus-cap",
          parameterIndex: 5,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    }
  ],
  actionEffects: [
    {
      activation: "automatic",
      id: "nicole.burst.pilgrimage_of_the_heavenly_path.arcane_projection.coordinated_damage",
      label: "圣言默示·天路历程 · 奥迹造影协同攻击",
      source: { characterId: "Nicole", kind: "character" },
      target: "additionalDamageEvent",
      value: {
        canCrit: true,
        coefficient: { kind: "fixed", value: 0 },
        element: "recipient_native",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        recipientFinalAttackFlatDamageMultiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "burst",
            id: "arcane-projection-damage",
            parameterIndex: 1,
            source: "talent",
            talentSlot: "burst"
          }
        },
        scalingStat: "attack"
      }
    },
    {
      activation: "automatic",
      condition: { kind: "hexerei_secret_rite" },
      id: "nicole.locked_passive.light_from_darkness.hexerei_arcane_projection.source_attack_addition",
      label: "魔女的前夜礼·光自暗来 · 魔导角色奥迹造影追加尼可300%攻击力伤害",
      source: { characterId: "Nicole", kind: "character" },
      target: "additionalDamageEvent",
      targetFilter: { recipientHexereiRequired: true },
      value: {
        canCrit: true,
        coefficient: { kind: "fixed", value: 0 },
        element: "recipient_native",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack",
        sourceFinalAttackFlatDamageMultiplier: { kind: "fixed", value: 3 }
      }
    },
    {
      activation: "maximum_reachable",
      id: "nicole.skill.sacred_word_revelation.unseen_light.grace_of_kenosis.attack_bonus",
      label: "恩典 · 攻击力提升",
      source: { characterId: "Nicole", kind: "character" },
      target: "flatAttack",
      value: {
        kind: "source_final_attack",
        maximumValue: {
          kind: "talent_parameter",
          parameter: {
            groupId: "skill",
            id: "grace-of-kenosis-attack-bonus-cap",
            parameterIndex: 5,
            source: "talent",
            talentSlot: "skill"
          }
        },
        multiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "skill",
            id: "grace-of-kenosis-attack-ratio",
            parameterIndex: 4,
            source: "talent",
            talentSlot: "skill"
          }
        }
      }
    }
  ],
  characterId: "Nicole",
  metrics: [
    {
      characterId: "Nicole",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "shield-of-blazing-light-flat-absorption",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 1386.6697, talentLevel: 1 },
          { expectedValue: 3050.9045, talentLevel: 10 }
        ]
      },
      id: "nicole.skill.sacred_word_revelation.unseen_light.blazing_light_shield.initial_absorption",
      kind: "scalar",
      label: "圣言默示·未现之光 / 灼耀之光护盾基础吸收量",
      ratioParameter: {
        reference: {
          groupId: "skill",
          id: "shield-of-blazing-light-attack-ratio",
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
      sourceActionId: "nicole.skill.sacred_word_revelation.unseen_light.blazing_light_shield",
      status: "verified",
      target: "friendly_recipient",
      unit: "hp"
    },
    {
      characterId: "Nicole",
      id: "nicole.skill.sacred_word_revelation.unseen_light.grace_of_kenosis.attack_bonus",
      kind: "scalar",
      label: "圣言默示·未现之光 / 恩典攻击力提升",
      maximumValueParameter: {
        reference: {
          groupId: "skill",
          id: "grace-of-kenosis-attack-bonus-cap",
          parameterIndex: 5,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 330, talentLevel: 1 },
          { expectedValue: 600, talentLevel: 10 }
        ]
      },
      ratioParameter: {
        reference: {
          groupId: "skill",
          id: "grace-of-kenosis-attack-ratio",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.0825, talentLevel: 1 },
          { expectedValue: 0.15, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "attack",
      semantic: "attack_buff",
      sourceActionId: "nicole.skill.sacred_word_revelation.unseen_light.grace_of_kenosis.attack_buff",
      status: "verified",
      target: "friendly_recipient",
      unit: "attack"
    }
  ],
  detail:
    "The selected support metrics calculate Shield of Blazing Light and Grace of Kenosis. Pilgrimage of the Heavenly Path's Arcane Projection is a separate non-reacting coordinated event based on the recipient's final Attack; Light from Darkness adds Nicole's 300% final Attack for Hexerei recipients. Duration, trigger cooldown, A1/A4 Guidance, and other constellations remain outside the single-action snapshot.",
  label: nicoleDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
