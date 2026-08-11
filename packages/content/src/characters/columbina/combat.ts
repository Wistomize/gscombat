import type { CharacterCombatCoverage } from "../../combat/types.js"

import { columbinaDefinition } from "./definition.js"

const gravityInterferenceActionIds = {
  lunarBloom: "columbina.skill.eternal_tides.gravity_interference.lunar_bloom",
  lunarCharged: "columbina.skill.eternal_tides.gravity_interference.lunar_charged",
  lunarCrystallize: "columbina.skill.eternal_tides.gravity_interference.lunar_crystallize"
} as const

const gravityInterferenceActions = Object.values(gravityInterferenceActionIds)
const lunarReactionKinds = ["lunar_bloom", "lunar_charged", "lunar_crystallize"] as const

export const columbinaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Columbina",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.46792, talentLevel: 1 },
            { expectedCoefficient: 0.842256, talentLevel: 10 }
          ]
        }
      ],
      element: columbinaDefinition.element,
      evaluator: "declared_direct",
      id: "columbina.normal.auto.first_hit",
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
      characterId: "Columbina",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "eternal-tides-skill-damage",
          id: "eternal-tides-initial-aoe",
          snapshotChecks: [
            { expectedCoefficient: 0.1672, talentLevel: 1 },
            { expectedCoefficient: 0.30096, talentLevel: 10 }
          ]
        }
      ],
      element: columbinaDefinition.element,
      evaluator: "declared_direct",
      id: "columbina.skill.eternal_tides.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "eternal-tides-skill-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Columbina",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "eternal-tides-gravity-ripple-continuous-damage",
          id: "eternal-tides-gravity-ripple-tick",
          snapshotChecks: [
            { expectedCoefficient: 0.0936, talentLevel: 1 },
            { expectedCoefficient: 0.16848, talentLevel: 10 }
          ]
        }
      ],
      element: columbinaDefinition.element,
      evaluator: "declared_direct",
      id: "columbina.skill.eternal_tides.gravity_ripple.tick",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "eternal-tides-gravity-ripple-continuous-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Columbina",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "gravity-interference-lunar-charged-damage",
          id: "gravity-interference-lunar-charged",
          snapshotChecks: [
            { expectedCoefficient: 0.04704, talentLevel: 1 },
            { expectedCoefficient: 0.084672, talentLevel: 10 }
          ]
        }
      ],
      element: "electro",
      evaluator: "declared_direct",
      id: gravityInterferenceActionIds.lunarCharged,
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "gravity-interference-lunar-charged-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "gravity-interference-lunar-charged",
            id: "gravity-interference-lunar-charged",
            snapshot: "hit",
            specialReaction: { kind: "lunar_charged" }
          }
        ],
        duration: 1
      }
    },
    {
      characterId: "Columbina",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "gravity-interference-lunar-bloom-damage",
          id: "gravity-interference-lunar-bloom",
          snapshotChecks: [
            { expectedCoefficient: 0.01408, talentLevel: 1 },
            { expectedCoefficient: 0.025344, talentLevel: 10 }
          ]
        }
      ],
      element: "dendro",
      evaluator: "declared_direct",
      id: gravityInterferenceActionIds.lunarBloom,
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "gravity-interference-lunar-bloom-damage",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "gravity-interference-lunar-bloom",
            hitCount: 5,
            id: "gravity-interference-lunar-bloom-five-hits",
            snapshot: "hit",
            specialReaction: { kind: "lunar_bloom" }
          }
        ],
        duration: 1
      },
      tracePresentation: {
        focusEventId: "gravity-interference-lunar-bloom-five-hits",
        focusLabel: "引力干涉·月绽放单次伤害",
        totalLabel: "引力干涉·月绽放五次伤害合计"
      }
    },
    {
      characterId: "Columbina",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "gravity-interference-lunar-crystallize-damage",
          id: "gravity-interference-lunar-crystallize",
          snapshotChecks: [
            { expectedCoefficient: 0.08824, talentLevel: 1 },
            { expectedCoefficient: 0.158832, talentLevel: 10 }
          ]
        }
      ],
      element: "geo",
      evaluator: "declared_direct",
      id: gravityInterferenceActionIds.lunarCrystallize,
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "gravity-interference-lunar-crystallize-damage",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "gravity-interference-lunar-crystallize",
            id: "gravity-interference-lunar-crystallize",
            snapshot: "hit",
            specialReaction: { kind: "lunar_crystallize" }
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "columbina.burst.lunar_domain.lunar_reaction_damage_bonus",
      label: "她的乡愁 · 月之领域内月曜反应伤害提升",
      source: { characterId: "Columbina", kind: "character" },
      target: "specialReactionDamageBonus",
      targetFilter: { specialReactionKinds: lunarReactionKinds },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "burst",
          id: "lunar-domain-lunar-reaction-damage-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "columbina.passive.lunar_reaction_base_damage_bonus",
      label: "月兆祝赐·借汝月光 · 月曜反应基础伤害加成",
      source: { characterId: "Columbina", kind: "character" },
      target: "specialReactionBaseDamageBonus",
      targetFilter: { specialReactionKinds: lunarReactionKinds },
      value: {
        kind: "final_hp",
        maximumValue: { kind: "fixed", value: 0.07 },
        multiplier: {
          kind: "talent_parameter",
          multiplier: 0.001,
          parameter: {
            groupId: "passive3",
            id: "lunar-reaction-base-damage-bonus-per-1000-hp",
            parameterIndex: 0,
            source: "talent",
            talentSlot: "passive"
          }
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "columbina.passive.gravity_interference.full_stacks.crit_rate",
      label: "固有天赋 · 引力干涉满3层（暴击率提高15%）",
      source: { characterId: "Columbina", kind: "character", minimumSourceAscension: 1 },
      target: "critRate",
      targetFilter: {
        actionIds: gravityInterferenceActions,
        recipientSourceRelation: "source",
        specialReactionKinds: lunarReactionKinds
      },
      value: {
        kind: "talent_parameter",
        multiplier: 3,
        parameter: {
          groupId: "passive1",
          id: "gravity-interference-crit-rate-per-stack",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "columbina.constellation.2.illumine_the_night.gravity_interference.radiant_moon.hp_percent",
      label: "为夜增辉，与君遥伴 · C2 引力干涉触发后的皎辉（生命值上限提高40%，8秒）",
      source: { characterId: "Columbina", kind: "character", minimumSourceConstellation: 2 },
      target: "hpPercent",
      targetFilter: {
        actionIds: gravityInterferenceActions,
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.4 }
    },
    ...[
      { actionId: gravityInterferenceActionIds.lunarCharged, multiplier: 0.125, reactionKind: "lunar_charged" as const },
      { actionId: gravityInterferenceActionIds.lunarBloom, multiplier: 0.025, reactionKind: "lunar_bloom" as const },
      { actionId: gravityInterferenceActionIds.lunarCrystallize, multiplier: 0.125, reactionKind: "lunar_crystallize" as const }
    ].map(({ actionId, multiplier, reactionKind }) => ({
      activation: "maximum_reachable" as const,
      id: `columbina.constellation.4.gravity_interference.${reactionKind}.flat_damage_addition`,
      label: `C4 引力干涉·${reactionKind === "lunar_charged" ? "月感电" : reactionKind === "lunar_bloom" ? "月绽放" : "月结晶"}固定伤害增加`,
      source: { characterId: "Columbina", kind: "character" as const, minimumSourceConstellation: 4 },
      target: "specialReactionFlatDamageAddition" as const,
      targetFilter: {
        actionIds: [actionId],
        recipientSourceRelation: "source" as const,
        specialReactionKinds: [reactionKind]
      },
      value: { kind: "final_hp" as const, multiplier: { kind: "fixed" as const, value: multiplier } }
    })),
    ...[
      { constellation: 1, value: 0.015 },
      { constellation: 2, value: 0.07 },
      { constellation: 3, value: 0.015 },
      { constellation: 4, value: 0.015 },
      { constellation: 5, value: 0.015 },
      { constellation: 6, value: 0.07 }
    ].map(({ constellation, value }) => ({
      activation: "maximum_reachable" as const,
      id: `columbina.constellation.${constellation}.party_lunar_reaction_elevation`,
      label: `哥伦比娅 C${constellation} · 全队月曜反应伤害擢升${(value * 100).toFixed(1)}%`,
      source: { characterId: "Columbina", kind: "character" as const, minimumSourceConstellation: constellation },
      target: "specialReactionElevation" as const,
      targetFilter: { specialReactionKinds: lunarReactionKinds },
      value: { kind: "fixed" as const, value }
    })),
    ...[
      { actionId: gravityInterferenceActionIds.lunarCharged, element: "electro" as const, label: "雷元素" },
      { actionId: gravityInterferenceActionIds.lunarBloom, element: "dendro" as const, label: "草元素" },
      { actionId: gravityInterferenceActionIds.lunarCrystallize, element: "geo" as const, label: "岩元素" }
    ].map(({ actionId, element, label }) => ({
      activation: "maximum_reachable" as const,
      id: `columbina.constellation.6.gravity_interference.${element}.crit_damage`,
      label: `夜昏且暗，且随月光 · C6 引力干涉后${label}伤害暴击伤害提高80%`,
      source: { characterId: "Columbina", kind: "character" as const, minimumSourceConstellation: 6 },
      target: "critDamage" as const,
      targetFilter: { actionIds: [actionId], elements: [element], recipientSourceRelation: "source" as const },
      value: { kind: "fixed" as const, value: 0.8 }
    })),
    {
      activation: "active",
      id: "columbina.constellation.6.follow_the_moon.lunar_reaction_hydro.crit_damage",
      label: "夜昏且暗，且随月光 · C6 月之领域内含水元素的月曜反应后（水元素伤害暴击伤害提高80%，8秒）",
      source: { characterId: "Columbina", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: { elements: ["hydro"] },
      value: { kind: "fixed", value: 0.8 }
    }
  ],
  characterId: "Columbina",
  metrics: [
    {
      actionId: gravityInterferenceActionIds.lunarCharged,
      characterId: "Columbina",
      id: gravityInterferenceActionIds.lunarCharged,
      kind: "damage",
      label: "万古潮汐 / 引力干涉·月感电伤害",
      sourceActionId: gravityInterferenceActionIds.lunarCharged,
      status: "verified",
      target: "enemy"
    },
    {
      actionId: gravityInterferenceActionIds.lunarBloom,
      characterId: "Columbina",
      id: gravityInterferenceActionIds.lunarBloom,
      kind: "damage",
      label: "万古潮汐 / 引力干涉·月绽放五次伤害合计",
      sourceActionId: gravityInterferenceActionIds.lunarBloom,
      status: "verified",
      target: "enemy"
    },
    {
      actionId: gravityInterferenceActionIds.lunarCrystallize,
      characterId: "Columbina",
      id: gravityInterferenceActionIds.lunarCrystallize,
      kind: "damage",
      label: "万古潮汐 / 引力干涉·月结晶伤害",
      sourceActionId: gravityInterferenceActionIds.lunarCrystallize,
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The selected metrics are Gravity Interference Lunar-Charged, the full five-hit Lunar-Bloom sequence, and Lunar-Crystallize. Each uses final HP in the independent Moon formula, including its reaction coefficient, base-damage bonus, reaction-damage bonus, post-reaction fixed addition, CRIT, resistance, and elevation; ordinary damage bonus and defense do not apply. The maximum three A1 stacks add 15% CRIT Rate. C2 adds 40% maximum HP to these self-owned Gravity Interference snapshots; C4 adds 12.5% final HP after the reaction multiplier for Lunar-Charged and Lunar-Crystallize, and 2.5% final HP to each of the five Lunar-Bloom hits. C1-C6 cumulative party elevation reaches 20% at C6, and C6 adds 80% CRIT Damage to each metric's corresponding Electro, Dendro, or Geo damage. C1's immediate extra Gravity Interference event and C2's active-character Attack, Elemental Mastery, or Defense branch are not merged into these metrics. The initial Skill hit, Gravity Ripple tick, and one normal hit remain lower-level actions; timing and rotations remain unmodeled.",
  label: columbinaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
