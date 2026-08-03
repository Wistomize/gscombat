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
    "One first normal-attack hit and one initial Sacred Word Revelation area hit remain verified lower-level C0 attack-scaling Pyro catalyst actions from the pinned 6.7 Genshin Optimizer snapshot at commit 21c98eb60355160274a8c4cecfc5671e2151a073, but neither is selected as Nicole's display output. The selected support metrics calculate one Shield of Blazing Light delivered to the current active friendly recipient as total Attack × skill[1] plus skill[2], before that recipient's Shield Strength, and Grace of Kenosis's current Attack bonus as min(total Attack × skill[4], skill[5]); C3 adds three Skill levels to both. The shield's 250% Pyro-damage absorption branch, duration, Grace activation and duration, A1/A4 Guidance, constellations other than C3, direct damage, reactions, external effects, timing, and other character states remain outside these source-owned outputs.",
  label: nicoleDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
