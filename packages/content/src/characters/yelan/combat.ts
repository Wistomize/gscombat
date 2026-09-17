import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage } from "../../combat/types.js"

import { yelanDefinition } from "./definition.js"

export const yelanCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("yelan", 3),
    { ...declareSkillCastCapability("yelan", 3, {"initialUses":2}), id: "yelan.kit.extra-skill-charge", minimumSourceConstellation: 1 },
    ...declareWeaponHitCapabilities(yelanDefinition),
    declareHitCapability("yelan.kit.skill_burst_hits", "战技/爆发直接命中准备", ["skill","burst"], ["hydro"]),
  ],
  actions: [
    {
      characterId: "Yelan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "lingering-lifeline-damage",
          id: "lingering-lifeline-explosion",
          snapshotChecks: [
            { expectedCoefficient: 0.226136, talentLevel: 1 },
            { expectedCoefficient: 0.407045, talentLevel: 10 }
          ]
        }
      ],
      element: yelanDefinition.element,
      evaluator: "declared_direct",
      id: "yelan.skill.lingering_lifeline.explosion",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "lingering-lifeline-damage",
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
      characterId: "Yelan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "depth-clarion-dice-initial-hit-damage",
          id: "depth-clarion-dice-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.07308, talentLevel: 1 },
            { expectedCoefficient: 0.131544, talentLevel: 10 }
          ]
        }
      ],
      element: yelanDefinition.element,
      evaluator: "declared_direct",
      id: "yelan.burst.depth_clarion_dice.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "depth-clarion-dice-initial-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Yelan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "exquisite-throw-damage",
          id: "exquisite-throw",
          snapshotChecks: [
            { expectedCoefficient: 0.04872, talentLevel: 1 },
            { expectedCoefficient: 0.087696, talentLevel: 10 }
          ]
        }
      ],
      element: yelanDefinition.element,
      evaluator: "declared_direct",
      id: "yelan.burst.exquisite_throw.single_wave",
      kind: "damage",
      fieldPresence: "off_field",
      parameterReferences: [
        {
          groupId: "burst",
          id: "exquisite-throw-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "burst",
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "exquisite-throw",
            hitCount: 3,
            id: "exquisite-throw-wave",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      attackKind: "charged",
      characterId: "Yelan",
      damageKind: "direct",
      damageParts: [
        {
          id: "c6-strategic-reserve-breakthrough-barb",
          scalingTerms: [
            {
              coefficientMultiplierScenarioParameterId: "c6-strategic-reserve-damage-percent",
              coefficientMultiplierScenarioParameterScale: 0.01,
              coefficientParameterId: "breakthrough-barb-damage",
              snapshotChecks: [
                { expectedCoefficient: 0.11576, talentLevel: 1 },
                { expectedCoefficient: 0.208368, talentLevel: 10 }
              ],
              stat: "hp"
            }
          ]
        }
      ],
      element: yelanDefinition.element,
      evaluator: "declared_direct",
      id: "yelan.constellation.6.winner_takes_all.strategic_reserve.breakthrough_barbs",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "breakthrough-barb-damage",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scenarioParameters: [
        {
          allowedValues: [0, 5],
          defaultValue: 0,
          id: "c6-strategic-reserve-arrow-count",
          label: "C6 取胜者，大小通吃 / 运筹帷幄破局矢数量",
          maximumValue: 0,
          minimumValue: 0,
          rangeBySourceConstellation: [
            { defaultValue: 5, maximumValue: 5, minimumSourceConstellation: 6, minimumValue: 5 }
          ]
        },
        {
          allowedValues: [0, 156],
          defaultValue: 0,
          id: "c6-strategic-reserve-damage-percent",
          label: "C6 取胜者，大小通吃 / 特殊破局矢为普通破局矢伤害的156%",
          maximumValue: 0,
          minimumValue: 0,
          rangeBySourceConstellation: [
            { defaultValue: 156, maximumValue: 156, minimumSourceConstellation: 6, minimumValue: 156 }
          ]
        }
      ],
      status: "verified",
      talentSlot: "normal",
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "c6-strategic-reserve-breakthrough-barb",
            hitCount: { kind: "scenario_parameter", parameterId: "c6-strategic-reserve-arrow-count" },
            id: "c6-strategic-reserve-breakthrough-barbs",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      activation: "automatic",
      condition: { kind: "team_unique_element_count", minimum: 1 },
      id: "yelan.passive.turn_control.first_unique_element.hp_percent",
      label: "固有天赋 · 猜先有方（队伍第1种元素，生命值上限提高6%）",
      source: { characterId: "Yelan", kind: "character", minimumSourceAscension: 1 },
      target: "hpPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.06 }
    },
    {
      activation: "automatic",
      condition: { kind: "team_unique_element_count", minimum: 2 },
      id: "yelan.passive.turn_control.second_unique_element.hp_percent_increment",
      label: "固有天赋 · 猜先有方（队伍第2种元素，生命值上限再提高6%）",
      source: { characterId: "Yelan", kind: "character", minimumSourceAscension: 1 },
      target: "hpPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.06 }
    },
    {
      activation: "automatic",
      condition: { kind: "team_unique_element_count", minimum: 3 },
      id: "yelan.passive.turn_control.third_unique_element.hp_percent_increment",
      label: "固有天赋 · 猜先有方（队伍第3种元素，生命值上限再提高6%）",
      source: { characterId: "Yelan", kind: "character", minimumSourceAscension: 1 },
      target: "hpPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.06 }
    },
    {
      activation: "automatic",
      condition: { kind: "team_unique_element_count", minimum: 4 },
      id: "yelan.passive.turn_control.fourth_unique_element.hp_percent_increment",
      label: "固有天赋 · 猜先有方（队伍第4种元素，生命值上限再提高12%）",
      source: { characterId: "Yelan", kind: "character", minimumSourceAscension: 1 },
      target: "hpPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.12 }
    },
    {
      activation: "maximum_reachable",
      id: "yelan.passive.adapt_with_ease.full_stacks.initial_damage_bonus",
      label: "固有天赋 · 妙转随心（满层快照：初始伤害提高1%）",
      source: { characterId: "Yelan", kind: "character", minimumSourceAscension: 4 },
      target: "damageBonus",
      targetFilter: {
        actionIds: ["yelan.constellation.6.winner_takes_all.strategic_reserve.breakthrough_barbs"],
        recipientSourceRelation: "source"
      },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "passive2",
          id: "adapt-with-ease-initial-damage-bonus",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "yelan.passive.adapt_with_ease.full_stacks.elapsed_damage_bonus",
      label: "固有天赋 · 妙转随心（满层快照：每秒3.5%累计14次，共49%）",
      source: { characterId: "Yelan", kind: "character", minimumSourceAscension: 4 },
      target: "damageBonus",
      targetFilter: {
        actionIds: ["yelan.constellation.6.winner_takes_all.strategic_reserve.breakthrough_barbs"],
        recipientSourceRelation: "source"
      },
      value: {
        kind: "talent_parameter",
        multiplier: 14,
        parameter: {
          groupId: "passive2",
          id: "adapt-with-ease-damage-bonus-per-second",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      }
    },
    {
      activation: "active",
      id: "yelan.constellation.4.bait_and_switch.full_stacks.hp_percent",
      label: "诓惑者，接树移花 · C4 满4次络命丝标记爆发后（全队生命上限提高40%，25秒）",
      source: { characterId: "Yelan", kind: "character", minimumSourceConstellation: 4 },
      target: "hpPercent",
      value: { kind: "fixed", value: 0.4 }
    }
  ],
  characterId: "Yelan",
  metrics: [
    {
      actionId: "yelan.skill.lingering_lifeline.explosion",
      characterId: "Yelan",
      id: "yelan.skill.lingering_lifeline.explosion",
      kind: "damage",
      label: "萦络纵命索 / 生命之线爆发（无反应）",
      sourceActionId: "yelan.skill.lingering_lifeline.explosion",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "yelan.burst.exquisite_throw.single_wave",
      characterId: "Yelan",
      id: "yelan.burst.exquisite_throw.single_wave",
      kind: "damage",
      label: "渊图玲珑骰 / 玄掷玲珑一轮三箭",
      sourceActionId: "yelan.burst.exquisite_throw.single_wave",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "yelan.constellation.6.winner_takes_all.strategic_reserve.breakthrough_barbs",
      characterId: "Yelan",
      id: "yelan.constellation.6.winner_takes_all.strategic_reserve.breakthrough_barbs",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "取胜者，大小通吃 / 五枚运筹帷幄破局矢有限合计（视为重击伤害）",
      sourceActionId: "yelan.constellation.6.winner_takes_all.strategic_reserve.breakthrough_barbs",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The first selected metric is one Lingering Lifeline explosion against one enemy, using max HP × skill[0] with no preset reaction. One Depth-Clarion Dice initial hit is separately verified as a baseline hit. The second selected metric is one Exquisite Throw wave of coordinated attacks, verified as three same-coefficient projectiles evaluated at hit time. At Ascension 1+, Turn Control automatically reads the configured team's unique elemental count and applies the exact 6%/12%/18%/30% maximum-HP tier as cumulative increments. C4 is a manual max-four-mark snapshot after four Lifeline marks have exploded and adds 40% Max HP to every party recipient for the following 25 seconds; the model does not infer marked-target count or timing. C6 declares its finite Strategic Reserve output: exactly five special Breakthrough Barbs, each scaling from max HP through auto[6] and then multiplied by the wording's 156%, with Charged-Attack category. Both arrow count and multiplier are zero through C5 and fixed at five and 156% at C6, so the C6 total cannot leak into lower constellations. Because this finite output remains reachable after waiting fourteen seconds inside the twenty-second Strategic Reserve window, its maximum-reachable snapshot applies Adapt With Ease's full 50% damage bonus as the initial 1% plus fourteen 3.5% increments. It does not infer the Burst cast, firing cadence, or a reaction. The full Burst duration, wave trigger cadence, hold duration, C2, reactions, and team timing remain unmodeled.",
  label: yelanDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
