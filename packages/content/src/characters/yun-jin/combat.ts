import type { CharacterCombatCoverage } from "../../combat/types.js"

import { yunJinDefinition } from "./definition.js"

export const yunJinCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "YunJin",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "cliffbreakers-banner-initial-hit-damage",
          id: "cliffbreakers-banner-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 2.44, talentLevel: 1 },
            { expectedCoefficient: 4.392, talentLevel: 10 }
          ]
        }
      ],
      element: yunJinDefinition.element,
      evaluator: "declared_direct",
      id: "yun_jin.burst.cliffbreakers_banner.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "cliffbreakers-banner-initial-hit-damage",
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
      characterId: "YunJin",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "opening-flourish-press-damage",
          id: "opening-flourish-press",
          snapshotChecks: [
            { expectedCoefficient: 1.4912, talentLevel: 1 },
            { expectedCoefficient: 2.68416, talentLevel: 10 }
          ]
        }
      ],
      element: yunJinDefinition.element,
      evaluator: "declared_direct",
      id: "yun_jin.skill.opening_flourish.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "opening-flourish-press-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "defense",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "YunJin",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.40506, talentLevel: 1 },
            { expectedCoefficient: 0.8007, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "yun_jin.normal.auto.first_hit",
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
      characterId: "YunJin",
      element: yunJinDefinition.element,
      id: "yun_jin.burst.flying_cloud_flag_formation",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "normal-attack-flat-damage-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "yun_jin.burst.flying_cloud_flag_formation.base_damage_increase",
      label: "飞云旗阵 · 普通攻击基础伤害提升",
      source: { characterId: "YunJin", kind: "character" },
      target: "baseDamageFlat",
      targetFilter: { attackKinds: ["normal"] },
      value: {
        kind: "source_final_defense",
        multiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "burst",
            id: "normal-attack-flat-damage-ratio",
            parameterIndex: 1,
            source: "talent",
            talentSlot: "burst"
          }
        }
      }
    },
    {
      activation: "active",
      id: "yun_jin.constellation.2.myriad_mise_en_scene.normal_attack_damage_bonus",
      label: "诸般切末 · C2 施放破嶂见旌仪后普通攻击伤害加成（12秒）",
      source: { characterId: "YunJin", kind: "character", minimumSourceConstellation: 2 },
      target: "damageBonus",
      targetFilter: { attackKinds: ["normal"] },
      value: { kind: "fixed", value: 0.15 }
    }
  ],
  characterId: "YunJin",
  metrics: [
    {
      characterId: "YunJin",
      id: "yun_jin.burst.flying_cloud_flag_formation.base_damage_increase",
      kind: "scalar",
      label: "飞云旗阵 / 单次普通攻击基础增伤值",
      ratioParameter: {
        reference: {
          groupId: "burst",
          id: "normal-attack-flat-damage-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.3216, talentLevel: 1 },
          { expectedValue: 0.57888, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "defense",
      semantic: "normal_attack_flat_damage_bonus",
      sourceActionId: "yun_jin.burst.flying_cloud_flag_formation",
      status: "verified",
      target: "friendly_recipient",
      unit: "damage"
    }
  ],
  detail:
    "One uninfused normal first hit is verified as baseline Physical damage. The selected support profile verifies Flying Cloud Flag Formation's base DEF-scaled damage increase for one Normal Attack hit, including C3 talent levels, without applying it to a fixed main DPS. C2 can be selected as an explicit current-action snapshot after Yun Jin casts Spring Spirit Summoning: Yun Jin and teammates gain 15% damage bonus only for Normal Attacks. It does not infer the cast, 12-second duration, timing, stack consumption, or a rotation. The party-element passive increment, C6 attack speed, charged holds and temporary shield remain in progress.",
  label: yunJinDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
