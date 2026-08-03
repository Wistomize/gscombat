import type { CharacterCombatCoverage } from "../../combat/types.js"

import { kujouSaraDefinition } from "./definition.js"

export const kujouSaraCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "KujouSara",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "subjugation-koukou-sendou-damage",
          id: "subjugation-koukou-sendou",
          snapshotChecks: [
            { expectedCoefficient: 4.096, talentLevel: 1 },
            { expectedCoefficient: 7.3728, talentLevel: 10 }
          ]
        }
      ],
      element: kujouSaraDefinition.element,
      evaluator: "declared_direct",
      id: "kujou_sara.burst.subjugation_koukou_sendou",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "subjugation-koukou-sendou-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "KujouSara",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "tengu-stormcall-ambush-damage",
          id: "tengu-stormcall-ambush",
          snapshotChecks: [
            { expectedCoefficient: 1.2576, talentLevel: 1 },
            { expectedCoefficient: 2.26368, talentLevel: 10 }
          ]
        }
      ],
      element: kujouSaraDefinition.element,
      evaluator: "declared_direct",
      id: "kujou_sara.skill.tengu_stormcall.ambush",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "tengu-stormcall-ambush-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "kujou_sara.skill.tengu_stormcall.ambush.attack_buff",
      label: "天狗咒雷·伏 · 攻击力提升",
      source: { characterId: "KujouSara", kind: "character" },
      target: "flatAttack",
      value: {
        kind: "source_base_attack",
        multiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "skill",
            id: "tengu-stormcall-attack-bonus-ratio",
            parameterIndex: 1,
            source: "talent",
            talentSlot: "skill"
          }
        }
      }
    },
    {
      activation: "active",
      id: "kujou_sara.constellation.6.tengu_juurai.electro_crit_damage",
      label: "C6 · 当前动作受天狗咒雷攻击力加成：雷元素暴击伤害 +60%",
      source: { characterId: "KujouSara", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: { elements: ["electro"] },
      value: { kind: "fixed", value: 0.6 }
    }
  ],
  characterId: "KujouSara",
  metrics: [
    {
      affectedStat: "attack_flat",
      characterId: "KujouSara",
      id: "kujou_sara.skill.tengu_stormcall.ambush.attack_buff",
      kind: "stat_buff",
      label: "鸦羽天狗霆雷召咒 / 天狗咒雷·伏单次加攻值",
      ratioParameter: {
        reference: {
          groupId: "skill",
          id: "tengu-stormcall-attack-bonus-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.4296, talentLevel: 1 },
          { expectedValue: 0.77328, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "当前场上受益角色位于天狗咒雷·伏的命中范围内" }
      ],
      scalingStat: "base_attack",
      sourceActionId: "kujou_sara.skill.tengu_stormcall.ambush",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "One Subjugation: Koukou Sendou hit and one Tengu Juurai: Ambush hit are verified as baseline C0 attack-scaling Electro hits. The selected support metric verifies one six-second Ambush flat ATK bonus as Kujou Sara's Base ATK times skill[1], for the current on-field recipient within the Ambush AoE. At C0, Crowfeather Cover is consumed by a fully charged Aimed Shot to leave the Crowfeather that triggers Ambush; C2 additionally leaves a weaker Crowfeather at Sara's original position, changing the trigger and location but not this ATK-bonus amount. C5 adds three Tengu Stormcall talent levels. When explicitly selected, C6 adds 60% Electro Crit DMG to a current action confirmed to be receiving a Tengu Juurai ATK bonus; it is separate from the flat-ATK metric. It does not calculate the AoE radius or position, Crowfeather timing, duration uptime, refresh and non-stacking behavior, the burst's Titanbreaker or Stormcluster buff sources, C1 cooldown reduction, A4 Energy restoration, reactions, or recipient damage.",
  label: kujouSaraDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
