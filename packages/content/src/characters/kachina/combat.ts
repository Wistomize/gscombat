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
    },
    {
      characterId: "Kachina",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "turbo-twirly-independent-damage",
          id: "c6-shield-destroyed-geo-damage-proxy",
          snapshotChecks: [{ expectedCoefficient: 0.6376, talentLevel: 1 }]
        }
      ],
      element: kachinaDefinition.element,
      evaluator: "declared_direct",
      id: "kachina.constellation.6.this_time_ive_gotta_win.shield_destroyed.geo_damage",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "turbo-twirly-independent-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "defense",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-shield-destroyed-geo-damage-ready",
          label: "C6 这次，我一定要赢：护盾被替换或摧毁后的岩元素伤害",
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
              parameterId: "c6-shield-destroyed-geo-damage-ready",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 0, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-shield-destroyed-geo-damage-proxy",
            id: "c6-shield-destroyed-geo-damage-proxy",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "kachina.constellation.4.more_foes_more_caution.four_enemies.defense_percent",
      label: "敌人越多，越要谨慎 · C4 超级钻钻领域内面对至少4名敌人（防御力提高20%）",
      source: { characterId: "Kachina", kind: "character", minimumSourceConstellation: 4 },
      target: "defensePercent",
      targetFilter: {
        actionIds: ["kachina.constellation.6.this_time_ive_gotta_win.shield_destroyed.geo_damage"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "team_nightsoul_burst", minimumTriggers: 1 },
      id: "kachina.passive.mountain_echoes.after_nightsoul_burst.geo_damage_bonus",
      label: "固有天赋 · 山的回声（夜魂迸发后12秒，岩元素伤害加成）",
      source: { characterId: "Kachina", kind: "character", minimumSourceAscension: 1 },
      target: "damageBonus",
      targetFilter: { elements: ["geo"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "maximum_reachable",
      id: "kachina.constellation.6.this_time_ive_gotta_win.shield_destroyed.geo_damage",
      label: "这次，我一定要赢 · C6 护盾被替换或摧毁后（200%卡齐娜防御力岩元素伤害）",
      source: { characterId: "Kachina", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: ["kachina.constellation.6.this_time_ive_gotta_win.shield_destroyed.geo_damage"],
        recipientSourceRelation: "source"
      },
      value: {
        canCrit: true,
        coefficient: { kind: "fixed", value: 2 },
        element: "geo",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "defense",
        talentSlot: "skill"
      }
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
    },
    {
      actionId: "kachina.constellation.6.this_time_ive_gotta_win.shield_destroyed.geo_damage",
      characterId: "Kachina",
      id: "kachina.constellation.6.this_time_ive_gotta_win.shield_destroyed.geo_damage",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "C6 这次，我一定要赢 / 护盾被替换或摧毁后岩元素伤害（4敌最大可达）",
      sourceActionId: "kachina.constellation.6.this_time_ive_gotta_win.shield_destroyed.geo_damage",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The selected profile separately verifies Turbo Twirly's DEF-scaling mounted and independent attacks plus the burst hit. At Ascension 1+, Mountain Echoes automatically adds 20% Geo DMG Bonus after a party-reachable Nightsoul Burst. At Ascension 4+, The Weight of Stone adds DEF × passive2[0] (20%) to both selected Turbo Twirly hit types before shared multipliers. C6 has an owner-scoped metric for the maximum-reachable shield-replacement or shield-destruction event: one Crit-eligible 200% Kachina DEF Geo hit using her own Geo bonus and Crit, with no output below C6. That named maximum snapshot places Kachina inside Super Drill Field against at least four opponents, so C4 contributes its highest 20% Defense tier before the C6 hit is resolved. It does not infer the field cast, shield timing, reactions, or other additional-hit behavior.",
  label: kachinaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
