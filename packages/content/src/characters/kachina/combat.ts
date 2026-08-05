import type { CharacterCombatCoverage } from "../../combat/types.js"

import { kachinaDefinition } from "./definition.js"

export const kachinaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Kachina",
      damageKind: "direct",
      damageParts: [
        {
          id: "turbo-twirly-mounted",
          scalingTerms: [
            {
              coefficientParameterId: "turbo-twirly-mounted-damage",
              snapshotChecks: [
                { expectedCoefficient: 0.8776, talentLevel: 1 },
                { expectedCoefficient: 1.57968, talentLevel: 10 }
              ],
              stat: "defense"
            },
            {
              coefficientParameterId: "the-weight-of-stone-defense-damage-increase",
              minimumSourceAscension: 4,
              snapshotChecks: [{ expectedCoefficient: 0.2, talentLevel: 1 }],
              stat: "defense"
            }
          ]
        }
      ],
      element: kachinaDefinition.element,
      evaluator: "declared_direct",
      id: "kachina.skill.go_go_turbo_twirly.mounted_attack",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "turbo-twirly-mounted-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "passive2",
          id: "the-weight-of-stone-defense-damage-increase",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Kachina",
      damageKind: "direct",
      damageParts: [
        {
          id: "turbo-twirly-independent",
          scalingTerms: [
            {
              coefficientParameterId: "turbo-twirly-independent-damage",
              snapshotChecks: [
                { expectedCoefficient: 0.6376, talentLevel: 1 },
                { expectedCoefficient: 1.14768, talentLevel: 10 }
              ],
              stat: "defense"
            },
            {
              coefficientParameterId: "the-weight-of-stone-defense-damage-increase",
              minimumSourceAscension: 4,
              snapshotChecks: [{ expectedCoefficient: 0.2, talentLevel: 1 }],
              stat: "defense"
            }
          ]
        }
      ],
      element: kachinaDefinition.element,
      evaluator: "declared_direct",
      id: "kachina.skill.go_go_turbo_twirly.independent_attack",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "turbo-twirly-independent-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "passive2",
          id: "the-weight-of-stone-defense-damage-increase",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Kachina",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "time-spirit-impact-damage",
          id: "time-spirit-impact",
          snapshotChecks: [
            { expectedCoefficient: 3.805672, talentLevel: 1 },
            { expectedCoefficient: 6.9264, talentLevel: 10 }
          ]
        }
      ],
      element: kachinaDefinition.element,
      evaluator: "declared_direct",
      id: "kachina.burst.time_spirit_impact",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "time-spirit-impact-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "defense",
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      condition: { kind: "team_nightsoul_burst", minimumTriggers: 1 },
      id: "kachina.passive.mountain_echoes.after_nightsoul_burst.geo_damage_bonus",
      label: "固有天赋 · 山的回声（夜魂迸发后12秒，岩元素伤害加成）",
      source: { characterId: "Kachina", kind: "character", minimumSourceAscension: 1 },
      target: "damageBonus",
      targetFilter: { elements: ["geo"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.2 }
    }
  ],
  characterId: "Kachina",
  metrics: [
    {
      actionId: "kachina.skill.go_go_turbo_twirly.independent_attack",
      characterId: "Kachina",
      id: "kachina.skill.go_go_turbo_twirly.independent_attack",
      kind: "damage",
      label: "出击，冲天转转！/ 单次独立攻击",
      sourceActionId: "kachina.skill.go_go_turbo_twirly.independent_attack",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "kachina.skill.go_go_turbo_twirly.mounted_attack",
      characterId: "Kachina",
      id: "kachina.skill.go_go_turbo_twirly.mounted_attack",
      kind: "damage",
      label: "出击，冲天转转！/ 单次搭乘攻击",
      sourceActionId: "kachina.skill.go_go_turbo_twirly.mounted_attack",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "kachina.burst.time_spirit_impact",
      characterId: "Kachina",
      id: "kachina.burst.time_spirit_impact",
      kind: "damage",
      label: "现在，认真时间！/ 技能伤害",
      sourceActionId: "kachina.burst.time_spirit_impact",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The selected profile separately verifies Turbo Twirly's DEF-scaling mounted and independent attacks plus the burst hit. At Ascension 1+, Mountain Echoes automatically adds 20% Geo DMG Bonus after a party-reachable Nightsoul Burst. At Ascension 4+, The Weight of Stone adds DEF × passive2[0] (20%) to both selected Turbo Twirly hit types before shared multipliers. C4 field DEF, timing, reactions, and additional hit behavior remain in progress.",
  label: kachinaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
