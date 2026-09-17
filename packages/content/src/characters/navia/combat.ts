import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage } from "../../combat/types.js"

import { naviaDefinition } from "./definition.js"

export const naviaCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("navia", 3, {"initialUses":2}),
    ...declareWeaponHitCapabilities(naviaDefinition),
    declareHitCapability("navia.kit.skill_burst_hits", "战技/爆发直接命中准备", ["skill","burst"], ["geo"]),
  ],
  actions: [
    {
      characterId: "Navia",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "rosula-shard-base-damage",
          id: "rosula-shard-base-damage",
          snapshotChecks: [
            { expectedCoefficient: 3.948, talentLevel: 1 },
            { expectedCoefficient: 7.1064, talentLevel: 10 }
          ]
        }
      ],
      element: naviaDefinition.element,
      evaluator: "declared_direct",
      id: "navia.skill.ceremonial_crystalshot",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "rosula-shard-base-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          defaultValue: 3,
          id: "crystal-shrapnel-count",
          label: "裂晶弹片消耗数",
          maximumValue: 3,
          minimumValue: 0
        },
        {
          defaultValue: 11,
          id: "rosula-shard-hit-count",
          label: "玫瑰晶弹实际命中数",
          maximumValue: 11,
          maximumValueByParameter: {
            parameterId: "crystal-shrapnel-count",
            values: [
              { maximumValue: 5, parameterValue: 0 },
              { maximumValue: 7, parameterValue: 1 },
              { maximumValue: 9, parameterValue: 2 },
              { maximumValue: 11, parameterValue: 3 }
            ]
          },
          minimumValue: 1
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
              parameterId: "rosula-shard-hit-count",
              values: [
                { multiplier: 1, parameterValue: 1 },
                { multiplier: 1.05, parameterValue: 2 },
                { multiplier: 1.1, parameterValue: 3 },
                { multiplier: 1.15, parameterValue: 4 },
                { multiplier: 1.2, parameterValue: 5 },
                { multiplier: 1.36, parameterValue: 6 },
                { multiplier: 1.4, parameterValue: 7 },
                { multiplier: 1.6, parameterValue: 8 },
                { multiplier: 1.66, parameterValue: 9 },
                { multiplier: 1.9, parameterValue: 10 },
                { multiplier: 2, parameterValue: 11 }
              ]
            },
            damagePartId: "rosula-shard-base-damage",
            id: "ceremonial-crystalshot",
            snapshot: "cast"
          }
        ],
        duration: 1
      }
    },
    {
      characterId: "Navia",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.93519, talentLevel: 1 },
            { expectedCoefficient: 1.848631, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "navia.normal.auto.first_hit",
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
      characterId: "Navia",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "as-the-sunlit-skys-singing-salute-initial-aoe-damage",
          id: "as-the-sunlit-skys-singing-salute-initial-aoe",
          snapshotChecks: [
            { expectedCoefficient: 0.752, talentLevel: 1 },
            { expectedCoefficient: 1.3536, talentLevel: 10 }
          ]
        }
      ],
      element: naviaDefinition.element,
      evaluator: "declared_direct",
      id: "navia.burst.as_the_sunlit_skys_singing_salute.initial_aoe",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "as-the-sunlit-skys-singing-salute-initial-aoe-damage",
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
      characterId: "Navia",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "as-the-sunlit-skys-singing-salute-support-cannonfire-damage",
          id: "as-the-sunlit-skys-singing-salute-support-cannonfire",
          snapshotChecks: [
            { expectedCoefficient: 0.4315, talentLevel: 1 },
            { expectedCoefficient: 0.7767, talentLevel: 10 }
          ]
        }
      ],
      element: naviaDefinition.element,
      evaluator: "declared_direct",
      id: "navia.burst.as_the_sunlit_skys_singing_salute.support_cannonfire",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "as-the-sunlit-skys-singing-salute-support-cannonfire-damage",
          parameterIndex: 1,
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
      activation: "active",
      id: "navia.burst.c4.geo_resistance_shred",
      label: "如同晴天般的霰落命中后 · C4 岩元素抗性降低（8秒）",
      source: { characterId: "Navia", kind: "character", minimumSourceConstellation: 4 },
      target: "enemyResistanceReduction",
      targetFilter: {
        elements: ["geo"],
        excludedActionIds: ["navia.burst.as_the_sunlit_skys_singing_salute.initial_aoe"]
      },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "active",
      id: "navia.constellation.2.the_presidents_pursuit_of_victory.three_shrapnel.crit_rate",
      label: "总指挥的乘胜追击 · C2 本次典仪式晶火消耗至少3枚裂晶弹片（暴击率+36%）",
      source: { characterId: "Navia", kind: "character", minimumSourceConstellation: 2 },
      target: "critRate",
      targetFilter: { actionIds: ["navia.skill.ceremonial_crystalshot"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.36 }
    },
    {
      activation: "active",
      exclusivity: { group: "navia-c6-excess-crystal-shrapnel", variant: "one" },
      id: "navia.constellation.6.flexible_finesse.one_excess_crystal_shrapnel.crit_damage",
      label: "刺玫会长的灵活手腕 · C6 本次典仪式晶火消耗4枚裂晶弹片（暴击伤害+45%）",
      source: { characterId: "Navia", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: { actionIds: ["navia.skill.ceremonial_crystalshot"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.45 }
    },
    {
      activation: "active",
      exclusivity: { group: "navia-c6-excess-crystal-shrapnel", variant: "two" },
      id: "navia.constellation.6.flexible_finesse.two_excess_crystal_shrapnel.crit_damage",
      label: "刺玫会长的灵活手腕 · C6 本次典仪式晶火消耗5枚裂晶弹片（暴击伤害+90%）",
      source: { characterId: "Navia", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: { actionIds: ["navia.skill.ceremonial_crystalshot"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.9 }
    },
    {
      activation: "active",
      exclusivity: { group: "navia-c6-excess-crystal-shrapnel", variant: "three" },
      id: "navia.constellation.6.flexible_finesse.three_excess_crystal_shrapnel.crit_damage",
      label: "刺玫会长的灵活手腕 · C6 本次典仪式晶火消耗6枚裂晶弹片（暴击伤害+135%）",
      source: { characterId: "Navia", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: { actionIds: ["navia.skill.ceremonial_crystalshot"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 1.35 }
    }
  ],
  characterId: "Navia",
  metrics: [
    {
      actionId: "navia.skill.ceremonial_crystalshot",
      characterId: "Navia",
      id: "navia.skill.ceremonial_crystalshot",
      kind: "damage",
      label: "典仪式晶火 / 实际命中玫瑰晶弹",
      sourceActionId: "navia.skill.ceremonial_crystalshot",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "navia.burst.as_the_sunlit_skys_singing_salute.initial_aoe",
      characterId: "Navia",
      id: "navia.burst.as_the_sunlit_skys_singing_salute.initial_aoe",
      kind: "damage",
      label: "如同晴天般的霰落 / 初始范围伤害",
      sourceActionId: "navia.burst.as_the_sunlit_skys_singing_salute.initial_aoe",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "navia.burst.as_the_sunlit_skys_singing_salute.support_cannonfire",
      characterId: "Navia",
      id: "navia.burst.as_the_sunlit_skys_singing_salute.single_support_cannonfire",
      kind: "damage",
      label: "如同晴天般的霰落 / 单次支援炮击",
      sourceActionId: "navia.burst.as_the_sunlit_skys_singing_salute.support_cannonfire",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "Ceremonial Crystalshot resolves its actual Rosula Shard hits against the selected 0–3 Crystal Shrapnel count, including its character-specific same-target total multiplier. C2's full 36% Crit Rate is an explicit current-action snapshot selected only when at least three Crystal Shrapnel are consumed. One initial burst AoE and one support cannonfire are also verified. C4 Geo resistance reduction after a burst hit remains an explicit current-action snapshot, and C6 exposes mutually exclusive 45%/90%/135% Crit-DMG states for four, five, or six consumed Shrapnel. Shard generation, long-hold timing, reactions, passives, infusion, and other character states remain unmodeled. No ordinary Crystallize shield metric is exposed.",
  label: naviaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
