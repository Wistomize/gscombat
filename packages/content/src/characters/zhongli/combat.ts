import type { CharacterCombatCoverage } from "../../combat/types.js"

import { zhongliDefinition } from "./definition.js"

export const zhongliCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Zhongli",
      damageKind: "direct",
      damageParts: [
        {
          id: "planet-befall-meteor",
          scalingTerms: [
            {
              coefficientParameterId: "planet-befall-meteor-damage",
              snapshotChecks: [
                { expectedCoefficient: 4.0108, talentLevel: 1 },
                { expectedCoefficient: 8.9972, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "dominance-of-earth-meteor-hp-ratio",
              minimumSourceAscension: 4,
              snapshotChecks: [{ expectedCoefficient: 0.33, talentLevel: 1 }],
              stat: "hp"
            }
          ]
        }
      ],
      element: zhongliDefinition.element,
      evaluator: "declared_direct",
      id: "zhongli.burst.planet_befall.meteor",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "planet-befall-meteor-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "passive2",
          id: "dominance-of-earth-meteor-hp-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Zhongli",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "dominus-lapidis-stone-stele-damage",
          id: "dominus-lapidis-stone-stele-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.16, talentLevel: 1 },
            { expectedCoefficient: 0.288, talentLevel: 10 }
          ]
        }
      ],
      element: zhongliDefinition.element,
      evaluator: "declared_direct",
      id: "zhongli.skill.dominus_lapidis.stone_stele.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "dominus-lapidis-stone-stele-damage",
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
      characterId: "Zhongli",
      element: zhongliDefinition.element,
      id: "zhongli.skill.dominus_lapidis.jade_shield",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "jade-shield-flat-absorption",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "jade-shield-hp-ratio",
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
      id: "zhongli.skill.jade_shield.universal_resistance_reduction",
      label: "玉璋护盾 · 全元素与物理抗性降低",
      source: { characterId: "Zhongli", kind: "character" },
      target: "enemyResistanceReduction",
      value: { kind: "fixed", value: 0.2 }
    }
  ],
  characterId: "Zhongli",
  metrics: [
    {
      characterId: "Zhongli",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "jade-shield-flat-absorption",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 1232.4108, talentLevel: 1 },
          { expectedValue: 2711.5093, talentLevel: 10 }
        ]
      },
      id: "zhongli.skill.jade_shield.initial_absorption",
      kind: "scalar",
      label: "玉璋护盾 / 初始吸收量",
      ratioParameter: {
        reference: {
          groupId: "skill",
          id: "jade-shield-hp-ratio",
          parameterIndex: 5,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.128, talentLevel: 1 },
          { expectedValue: 0.2304, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "hp",
      semantic: "shield",
      sourceActionId: "zhongli.skill.dominus_lapidis.jade_shield",
      status: "verified",
      target: "friendly_recipient",
      unit: "hp"
    },
    {
      characterId: "Zhongli",
      flat: 0.2,
      id: "zhongli.skill.jade_shield.universal_resistance_reduction",
      kind: "scalar",
      label: "玉璋护盾 / 全元素与物理抗性降低",
      semantic: "resistance_reduction",
      sourceActionId: "zhongli.skill.dominus_lapidis.jade_shield",
      status: "verified",
      target: "enemy",
      unit: "ratio"
    },
    {
      actionId: "zhongli.burst.planet_befall.meteor",
      characterId: "Zhongli",
      id: "zhongli.burst.planet_befall.meteor",
      kind: "damage",
      label: "天星 / 陨石伤害",
      sourceActionId: "zhongli.burst.planet_befall.meteor",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The selected profile verifies Jade Shield's initial HP-scaled absorption, its universal resistance reduction, and Planet Befall damage as separate metrics. At ascension 4+, Dominance of Earth adds max HP × passive2[2] (33%) to this Meteor before shared multipliers. Shield-strength stacks, C6 healing, Stone Stele resonance, petrification, reactions, and timing remain in progress.",
  label: zhongliDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
