import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage } from "../../combat/types.js"

import { ororonDefinition } from "./definition.js"

export const ororonCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("ororon", 1),
    ...declareWeaponHitCapabilities(ororonDefinition),
    declareHitCapability("ororon.kit.skill_burst_hits", "战技/爆发直接命中准备", ["skill","burst"], ["electro"]),
  ],
  actions: [
    {
      characterId: "Ororon",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "nights-shade-synesthetic-gathering-damage",
          id: "nights-shade-synesthetic-gathering",
          snapshotChecks: [
            { expectedCoefficient: 1.976, talentLevel: 1 },
            { expectedCoefficient: 3.5568, talentLevel: 10 }
          ]
        }
      ],
      element: ororonDefinition.element,
      evaluator: "declared_direct",
      id: "ororon.skill.nights_shade_synesthetic_gathering",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "nights-shade-synesthetic-gathering-damage",
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
      characterId: "Ororon",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "dark-voices-echo-activation-hit-damage",
          id: "dark-voices-echo-activation-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.74384, talentLevel: 1 },
            { expectedCoefficient: 3.138912, talentLevel: 10 }
          ]
        }
      ],
      element: ororonDefinition.element,
      evaluator: "declared_direct",
      id: "ororon.burst.dark_voices_echo.activation_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "dark-voices-echo-activation-hit-damage",
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
      characterId: "Ororon",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "nightshade-synesthesia-super-sensory-thunderbolt-damage",
          id: "super-sensory-thunderbolt",
          snapshotChecks: [{ expectedCoefficient: 1.6, talentLevel: 1 }]
        }
      ],
      element: ororonDefinition.element,
      evaluator: "declared_direct",
      id: "ororon.passive.nightshade_synesthesia.super_sensory_thunderbolt",
      kind: "damage",
      fieldPresence: "off_field",
      parameterReferences: [
        {
          groupId: "passive1",
          id: "nightshade-synesthesia-super-sensory-thunderbolt-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "passive"
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "ororon.constellation.1.trails_amidst_forest_fog.nighttide.hypersense.damage_bonus",
      label: "雾林间的行迹 · C1 目标已处于夜翳状态（显象超感伤害提高50%）",
      source: { characterId: "Ororon", kind: "character", minimumSourceConstellation: 1 },
      target: "damageBonus",
      targetFilter: {
        recipientSourceRelation: "source",
        talentSlots: ["passive"]
      },
      value: { kind: "fixed", value: 0.5 }
    },
    {
      activation: "maximum_reachable",
      id: "ororon.constellation.2.king_bee.spiritual_supersense.base.electro_damage_bonus",
      label: "藏蜜酒的蜂王 · C2 施放黯声回响后（雷元素伤害加成8%，9秒）",
      source: { characterId: "Ororon", kind: "character", minimumSourceConstellation: 2 },
      target: "damageBonus",
      targetFilter: { elements: ["electro"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.08 }
    },
    ...([1, 2, 3, 4] as const).map((enemyCount) => ({
      activation: "maximum_reachable" as const,
      condition: { kind: "enemy_count" as const, minimum: enemyCount },
      id: `ororon.constellation.2.king_bee.spiritual_supersense.enemy_${enemyCount}.electro_damage_bonus`,
      label: `藏蜜酒的蜂王 · C2 灵觉超感期间命中第${enemyCount}名敌人（雷元素伤害加成8%）`,
      source: { characterId: "Ororon", kind: "character" as const, minimumSourceConstellation: 2 },
      target: "damageBonus" as const,
      targetFilter: { elements: ["electro"] as const, recipientSourceRelation: "source" as const },
      value: { kind: "fixed" as const, value: 0.08 }
    })),
    {
      activation: "automatic",
      id: "ororon.constellation.6.deepest_depths.praise.burst_super_sensory_thunderbolt",
      label: "致深泉的颂赞 · C6 施放黯声回响时触发一次200%显象超感伤害",
      source: { characterId: "Ororon", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: ["ororon.burst.dark_voices_echo.activation_hit"],
        recipientSourceRelation: "source"
      },
      value: {
        canCrit: true,
        coefficient: { kind: "fixed", value: 3.2 },
        element: "electro",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack",
        talentSlot: "passive"
      }
    },
    {
      activation: "active",
      exclusivity: { group: "ororon-c6-current-active-character-stacks", variant: "one" },
      id: "ororon.constellation.6.deepest_depths.praise.one_stack.attack_percent",
      label: "致深泉的颂赞 · C6 显象超感后当前场上角色1层攻击力提升（10%，9秒）",
      source: { characterId: "Ororon", kind: "character", minimumSourceConstellation: 6 },
      target: "attackPercent",
      value: { kind: "fixed", value: 0.1 }
    },
    {
      activation: "active",
      exclusivity: { group: "ororon-c6-current-active-character-stacks", variant: "two" },
      id: "ororon.constellation.6.deepest_depths.praise.two_stacks.attack_percent",
      label: "致深泉的颂赞 · C6 显象超感后当前场上角色2层攻击力提升（20%，每层独立计时）",
      source: { characterId: "Ororon", kind: "character", minimumSourceConstellation: 6 },
      target: "attackPercent",
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "active",
      exclusivity: { group: "ororon-c6-current-active-character-stacks", variant: "three" },
      id: "ororon.constellation.6.deepest_depths.praise.three_stacks.attack_percent",
      label: "致深泉的颂赞 · C6 显象超感后当前场上角色3层攻击力提升（30%，每层独立计时）",
      source: { characterId: "Ororon", kind: "character", minimumSourceConstellation: 6 },
      target: "attackPercent",
      value: { kind: "fixed", value: 0.3 }
    }
  ],
  characterId: "Ororon",
  metrics: [
    {
      actionId: "ororon.burst.dark_voices_echo.activation_hit",
      characterId: "Ororon",
      id: "ororon.burst.dark_voices_echo.activation_hit",
      kind: "damage",
      label: "黯声回响 / 施放命中（C6自动追加一次200%显象超感伤害）",
      sourceActionId: "ororon.burst.dark_voices_echo.activation_hit",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "ororon.passive.nightshade_synesthesia.super_sensory_thunderbolt",
      characterId: "Ororon",
      id: "ororon.passive.nightshade_synesthesia.super_sensory_thunderbolt",
      kind: "damage",
      label: "夜翳交织 / 超感知雷击单次命中（触发条件已满足）",
      sourceActionId: "ororon.passive.nightshade_synesthesia.super_sensory_thunderbolt",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The maintained metrics are one Nightshade Synesthesia Super-Sensory Thunderbolt after its trigger condition has been fulfilled and Dark Voices Echo's activation hit. The former is Attack × passive1[1], a fixed 160% Attack Electro hit. C1 exposes the target's Nighttide state explicitly and adds 50% Damage Bonus to Hypersense, including the C6 Burst-triggered Hypersense event. C2's maximum-reachable post-Burst snapshot adds 8% Electro Damage Bonus, then another 8% for each of up to four enemies hit, resolved from the selected enemy count for a 16% to 40% total. At C6, casting Dark Voices Echo automatically adds one Super-Sensory Thunderbolt at 200% of its original damage, represented as a 320% Attack Electro event in the Burst metric. C6's one-, two-, and three-stack current-active-character Attack bonuses remain explicit mutually exclusive snapshots because each stack has its own nine-second timer. The actions do not infer prerequisite reactions, Nightsoul consumption, periodic sound-wave collisions, target aura, or rotation timing.",
  label: ororonDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
