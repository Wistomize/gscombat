import type { CharacterCombatCoverage } from "../../combat/types.js"

import { gorouDefinition } from "./definition.js"

export const gorouCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Gorou",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "inuzaka-all-round-defense-damage",
          id: "inuzaka-all-round-defense",
          snapshotChecks: [
            { expectedCoefficient: 1.072, talentLevel: 1 },
            { expectedCoefficient: 1.9296, talentLevel: 10 }
          ]
        }
      ],
      element: gorouDefinition.element,
      evaluator: "declared_direct",
      id: "gorou.skill.inuzaka_all_round_defense",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "inuzaka-all-round-defense-damage",
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
      characterId: "Gorou",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "juuga-forward-unto-victory-skill-damage",
          id: "juuga-forward-unto-victory-initial-aoe",
          snapshotChecks: [
            { expectedCoefficient: 0.98216, talentLevel: 1 },
            { expectedCoefficient: 1.767888, talentLevel: 10 }
          ]
        }
      ],
      element: gorouDefinition.element,
      evaluator: "declared_direct",
      id: "gorou.burst.juuga_forward_unto_victory.initial_aoe",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "juuga-forward-unto-victory-skill-damage",
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
      characterId: "Gorou",
      element: gorouDefinition.element,
      id: "gorou.skill.inuzaka_all_round_defense.field",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "field-defense-flat-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "field-geo-damage-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Gorou",
      element: gorouDefinition.element,
      id: "gorou.burst.general_glory.field",
      kind: "support",
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "gorou.skill.field.defense_buff",
      label: "大将旗指物 · 防御力提升",
      source: { characterId: "Gorou", kind: "character" },
      target: "defenseFlat",
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "skill",
          id: "field-defense-flat-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      }
    },
    {
      activation: "maximum_reachable",
      condition: { elements: ["geo"], kind: "team_element_count", minimum: 3 },
      id: "gorou.skill.field.geo_damage_bonus",
      label: "大将旗指物 · 摧碎（岩元素伤害加成）",
      source: { characterId: "Gorou", kind: "character" },
      target: "damageBonus",
      targetFilter: { elements: ["geo"] },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "skill",
          id: "field-geo-damage-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "gorou.burst.general_glory.defense_percent_buff",
      label: "不畏风雨 · 队伍防御力提升",
      source: { characterId: "Gorou", kind: "character" },
      target: "defensePercent",
      value: { kind: "fixed", value: 0.25 }
    },
    {
      activation: "active",
      condition: { kind: "primary_same_element_teammate_count", maximum: 0, minimum: 0 },
      exclusivity: { group: "gorou-c6-field-level", variant: "one-geo" },
      id: "gorou.constellation.6.valorous_hound.one_geo.crit_damage",
      label: "犬勇·忠如山 · C6 坚牢（1名岩元素角色，岩元素伤害暴击伤害提高10%，12秒）",
      source: { characterId: "Gorou", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: { elements: ["geo"] },
      value: { kind: "fixed", value: 0.1 }
    },
    {
      activation: "active",
      condition: { kind: "primary_same_element_teammate_count", maximum: 1, minimum: 1 },
      exclusivity: { group: "gorou-c6-field-level", variant: "two-geo" },
      id: "gorou.constellation.6.valorous_hound.two_geo.crit_damage",
      label: "犬勇·忠如山 · C6 难破（2名岩元素角色，岩元素伤害暴击伤害提高20%，12秒）",
      source: { characterId: "Gorou", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: { elements: ["geo"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "active",
      condition: { kind: "primary_same_element_teammate_count", minimum: 2 },
      exclusivity: { group: "gorou-c6-field-level", variant: "three-or-more-geo" },
      id: "gorou.constellation.6.valorous_hound.three_or_more_geo.crit_damage",
      label: "犬勇·忠如山 · C6 摧碎（3名及以上岩元素角色，岩元素伤害暴击伤害提高40%，12秒）",
      source: { characterId: "Gorou", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: { elements: ["geo"] },
      value: { kind: "fixed", value: 0.4 }
    }
  ],
  characterId: "Gorou",
  metrics: [
    {
      characterId: "Gorou",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "field-defense-flat-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 206.16, talentLevel: 1 },
          { expectedValue: 371.088, talentLevel: 10 }
        ]
      },
      id: "gorou.skill.field.defense_buff",
      kind: "scalar",
      label: "犬坂吠吠方圆阵 / 防御力提升",
      recipientRequirements: [{ kind: "recipient_in_source_area", label: "受益角色位于大将旗指物领域内" }],
      semantic: "defense_buff",
      sourceActionId: "gorou.skill.inuzaka_all_round_defense.field",
      status: "verified",
      target: "friendly_recipient",
      unit: "defense"
    },
    {
      characterId: "Gorou",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "field-geo-damage-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.15, talentLevel: 1 },
          { expectedValue: 0.15, talentLevel: 10 }
        ]
      },
      id: "gorou.skill.field.geo_damage_bonus",
      kind: "scalar",
      label: "犬坂吠吠方圆阵 / 岩元素伤害加成",
      recipientRequirements: [{ kind: "recipient_in_source_area", label: "受益角色位于摧碎领域内" }],
      semantic: "damage_bonus",
      sourceActionId: "gorou.skill.inuzaka_all_round_defense.field",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    },
    {
      characterId: "Gorou",
      flat: 0.25,
      id: "gorou.burst.general_glory.defense_percent_buff",
      kind: "scalar",
      label: "兽牙逐突形胜战法 / 防御力提升",
      recipientRequirements: [],
      semantic: "defense_buff",
      sourceActionId: "gorou.burst.general_glory.field",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    }
  ],
  detail:
    "The selected support profile verifies the field's flat DEF and Geo damage bonuses plus the burst passive's 25% DEF bonus without converting them into another character's damage. One skill hit and one burst initial AoE remain available as baseline direct actions. C6 supplies three mutually exclusive manually selected snapshots after Skill or Burst: its current one-, two-, or three-or-more-Geo field level adds 10%, 20%, or 40% Geo Crit DMG to eligible party damage for 12 seconds. The derived party composition is checked against the target recipient; the effect does not infer casting, field range, or duration. Crystal Collapse, C4 healing, reactions, timing, and additional hit behavior remain unmodeled.",
  label: gorouDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
