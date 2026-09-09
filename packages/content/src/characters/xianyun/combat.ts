import type { CharacterCombatCoverage } from "../../combat/types.js"

import { xianyunDefinition } from "./definition.js"

export const xianyunCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Xianyun",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.403024, talentLevel: 1 },
            { expectedCoefficient: 0.725443, talentLevel: 10 }
          ]
        }
      ],
      element: xianyunDefinition.element,
      evaluator: "declared_direct",
      id: "xianyun.normal.auto.first_hit",
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
      characterId: "Xianyun",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "white-clouds-at-dawn-skill-damage",
          id: "white-clouds-at-dawn-first-skyladder",
          snapshotChecks: [
            { expectedCoefficient: 0.248, talentLevel: 1 },
            { expectedCoefficient: 0.4464, talentLevel: 10 }
          ]
        }
      ],
      element: xianyunDefinition.element,
      evaluator: "declared_direct",
      id: "xianyun.skill.white_clouds_at_dawn.first_skyladder",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "white-clouds-at-dawn-skill-damage",
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
      attackKind: "plunge",
      characterId: "Xianyun",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "white-clouds-at-dawn-third-skyladder-driftcloud-wave-damage",
          id: "third-skyladder-driftcloud-wave",
          snapshotChecks: [
            { expectedCoefficient: 3.376, talentLevel: 1 },
            { expectedCoefficient: 6.0768, talentLevel: 10 }
          ]
        }
      ],
      element: xianyunDefinition.element,
      evaluator: "declared_direct",
      id: "xianyun.skill.white_clouds_at_dawn.third_skyladder.driftcloud_wave",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "white-clouds-at-dawn-third-skyladder-driftcloud-wave-damage",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Xianyun",
      element: xianyunDefinition.element,
      id: "xianyun.burst.stars_gather_at_dusk.instant_healing",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "stars-gather-at-dusk-instant-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "stars-gather-at-dusk-instant-healing-attack-ratio",
          parameterIndex: 3,
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
      exclusivity: { group: "xianyun-consider-the-adeptus-plunge-base-damage", variant: "base" },
      id: "xianyun.passive.consider_the_adeptus_in_her_realm.plunge_base_damage",
      label: "细想应是洞中仙 · 下落攻击坠地冲击基础伤害提升",
      source: { characterId: "Xianyun", kind: "character", minimumSourceAscension: 4 },
      target: "baseDamageFlat",
      targetFilter: { attackKinds: ["plunge"] },
      value: {
        kind: "source_final_attack",
        maximumValue: { kind: "fixed", value: 9000 },
        multiplier: { kind: "fixed", value: 2 }
      }
    },
    {
      activation: "maximum_reachable",
      exclusivity: { group: "xianyun-consider-the-adeptus-plunge-base-damage", variant: "c2" },
      id: "xianyun.constellation.2.consider_the_adeptus_in_her_realm.plunge_base_damage",
      label: "鹤唳远人间 · C2 下落攻击坠地冲击基础伤害提升",
      source: {
        characterId: "Xianyun",
        kind: "character",
        minimumSourceAscension: 4,
        minimumSourceConstellation: 2
      },
      target: "baseDamageFlat",
      targetFilter: { attackKinds: ["plunge"] },
      value: {
        kind: "source_final_attack",
        maximumValue: { kind: "fixed", value: 18000 },
        multiplier: { kind: "fixed", value: 4 },
        sourceAttackSnapshotEffectIds: ["xianyun.constellation.2.white_clouds_at_dawn.self_attack_percent"]
      }
    },
    {
      activation: "active",
      id: "xianyun.constellation.2.white_clouds_at_dawn.self_attack_percent",
      label: "鹤唳远人间 · C2 施放步天梯后闲云攻击力提高20%",
      requiredActiveEffectIds: ["xianyun.constellation.2.consider_the_adeptus_in_her_realm.plunge_base_damage"],
      source: { characterId: "Xianyun", kind: "character", minimumSourceConstellation: 2 },
      target: "attackPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "automatic",
      id: "xianyun.constellation.6.they_call_her_cloud_retainer.third_skyladder.crit_damage",
      label: "知是留云僊 · C6 三次步天梯后的闲云冲击波暴击伤害提高70%",
      source: { characterId: "Xianyun", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: {
        actionIds: ["xianyun.skill.white_clouds_at_dawn.third_skyladder.driftcloud_wave"],
        attackKinds: ["plunge"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.7 }
    }
  ],
  characterId: "Xianyun",
  metrics: [
    {
      characterId: "Xianyun",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "stars-gather-at-dusk-instant-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 577.7816, talentLevel: 1 },
          { expectedValue: 1271.216, talentLevel: 10 }
        ]
      },
      id: "xianyun.burst.stars_gather_at_dusk.instant_healing",
      includeHealingBonus: true,
      kind: "healing",
      label: "暮集竹星 / 施放单名队员治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "stars-gather-at-dusk-instant-healing-attack-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.9216, talentLevel: 1 },
          { expectedValue: 1.65888, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受治疗角色为施放时队伍中的附近角色" }
      ],
      scalingStat: "attack",
      sourceActionId: "xianyun.burst.stars_gather_at_dusk.instant_healing",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      actionId: "xianyun.skill.white_clouds_at_dawn.third_skyladder.driftcloud_wave",
      characterId: "Xianyun",
      id: "xianyun.skill.white_clouds_at_dawn.third_skyladder.driftcloud_wave",
      kind: "damage",
      label: "朝起鹤云 / 三次步天梯后的闲云冲击波（无反应）",
      sourceActionId: "xianyun.skill.white_clouds_at_dawn.third_skyladder.driftcloud_wave",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The selected Xianyun profile reports Stars Gather at Dusk's cast heal and one three-Skyladder Driftcloud Wave. The heal is Xianyun's Attack × burst[3] + burst[2], followed by source Healing Bonus and recipient Incoming Healing Bonus; C3 adds three Burst levels. The Driftcloud Wave uses skill[3] and Plunging Attack classification. Consider, the Adeptus in Her Realm contributes 200% of Xianyun's final Attack capped at 9,000, while C2 replaces it with 400% capped at 18,000 and includes C2's 20% self Attack snapshot after Skyladder. C5 raises the Skill coefficient, and C6 automatically adds the full three-Skyladder 70% Crit DMG to this selected wave. C6's cooldown bypass changes how many waves fit into sixteen seconds rather than the value of this one hit. One first normal hit and one first Skyladder remain verified lower-level actions. Starwicker periodic healing/coordinated damage, C4's triggered party heal, complete eight-use cadence, target count, reactions, external effects, and rotation behavior remain outside these metrics.",
  label: xianyunDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
