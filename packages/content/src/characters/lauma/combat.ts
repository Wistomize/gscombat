import type { CharacterCombatCoverage } from "../../combat/types.js"

import { laumaDefinition } from "./definition.js"

export const laumaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Lauma",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.337024, talentLevel: 1 },
            { expectedCoefficient: 0.606643, talentLevel: 10 }
          ]
        }
      ],
      element: laumaDefinition.element,
      evaluator: "declared_direct",
      id: "lauma.normal.auto.first_hit",
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
      characterId: "Lauma",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "runo-dawnless-rest-press-damage",
          id: "runo-dawnless-rest-press",
          snapshotChecks: [
            { expectedCoefficient: 1.216, talentLevel: 1 },
            { expectedCoefficient: 2.1888, talentLevel: 10 }
          ]
        }
      ],
      element: laumaDefinition.element,
      evaluator: "declared_direct",
      id: "lauma.skill.runo_dawnless_rest_of_karsikko.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "runo-dawnless-rest-press-damage",
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
      characterId: "Lauma",
      element: laumaDefinition.element,
      id: "lauma.burst.pale_hymn",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "bloom-related-reaction-damage-increase",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "lunar-bloom-reaction-damage-increase",
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
      id: "lauma.burst.pale_hymn.bloom_related_reaction_flat_damage_addition",
      label: "苍色祷歌 · 绽放相关反应基础伤害增加",
      source: { characterId: "Lauma", kind: "character" },
      target: "transformativeReactionFlatDamageAddition",
      targetFilter: { reactionKinds: ["bloom", "hyperbloom", "burgeon"] },
      value: {
        kind: "final_elemental_mastery",
        multiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "burst",
            id: "bloom-related-reaction-damage-increase",
            parameterIndex: 2,
            source: "talent",
            talentSlot: "burst"
          }
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "lauma.burst.pale_hymn.lunar_bloom_flat_damage_addition",
      label: "苍色祷歌 · 月绽放基础伤害增加",
      source: { characterId: "Lauma", kind: "character" },
      target: "specialReactionFlatDamageAddition",
      targetFilter: { specialReactionKinds: ["lunar_bloom"] },
      value: {
        kind: "final_elemental_mastery",
        multiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "burst",
            id: "lunar-bloom-reaction-damage-increase",
            parameterIndex: 3,
            source: "talent",
            talentSlot: "burst"
          }
        }
      }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
      id: "lauma.passive.light_for_the_frosty_night.lunar_bloom_crit_damage",
      label: "固有天赋·霜夜之光 · 满辉月绽放暴击伤害",
      source: { characterId: "Lauma", kind: "character", minimumSourceAscension: 1 },
      target: "critDamage",
      targetFilter: { specialReactionKinds: ["lunar_bloom"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
      id: "lauma.passive.light_for_the_frosty_night.lunar_bloom_crit_rate",
      label: "固有天赋·霜夜之光 · 满辉月绽放暴击率",
      source: { characterId: "Lauma", kind: "character", minimumSourceAscension: 1 },
      target: "critRate",
      targetFilter: { specialReactionKinds: ["lunar_bloom"] },
      value: { kind: "fixed", value: 0.1 }
    },
    {
      activation: "maximum_reachable",
      id: "lauma.passive.moonsign_benediction.natures_chorus.lunar_bloom_base_damage_bonus",
      label: "月兆祝赐·自然的和声 · 月绽放基础伤害加成",
      source: { characterId: "Lauma", kind: "character" },
      target: "specialReactionBaseDamageBonus",
      targetFilter: { specialReactionKinds: ["lunar_bloom"] },
      value: {
        kind: "final_elemental_mastery",
        maximumValue: { kind: "fixed", value: 0.14 },
        multiplier: { kind: "fixed", value: 0.000175 }
      }
    },
    {
      activation: "maximum_reachable",
      id: "lauma.skill.runo_dawnless_rest_of_karsikko.dendro_hydro_resistance_reduction",
      label: "凛冽冰霜的庇护 · 命中后草/水元素抗性降低",
      source: { characterId: "Lauma", kind: "character" },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["dendro", "hydro"] },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "skill",
          id: "frostgrove-sanctuary-resistance-reduction",
          parameterIndex: 7,
          source: "talent",
          talentSlot: "skill"
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "lauma.constellation.2.twine_warnings_and_tales_from_the_north.bloom_related_reaction_flat_damage_addition",
      label: "C2 警语与北地传说 · 苍色祷歌绽放相关反应额外基础伤害增加",
      source: { characterId: "Lauma", kind: "character", minimumSourceConstellation: 2 },
      target: "transformativeReactionFlatDamageAddition",
      targetFilter: { reactionKinds: ["bloom", "hyperbloom", "burgeon"] },
      value: { kind: "final_elemental_mastery", multiplier: { kind: "fixed", value: 5 } }
    },
    {
      activation: "maximum_reachable",
      id: "lauma.constellation.2.twine_warnings_and_tales_from_the_north.lunar_bloom_flat_damage_addition",
      label: "C2 警语与北地传说 · 苍色祷歌月绽放额外基础伤害增加",
      source: { characterId: "Lauma", kind: "character", minimumSourceConstellation: 2 },
      target: "specialReactionFlatDamageAddition",
      targetFilter: { specialReactionKinds: ["lunar_bloom"] },
      value: { kind: "final_elemental_mastery", multiplier: { kind: "fixed", value: 4 } }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
      id: "lauma.constellation.2.twine_warnings_and_tales_from_the_north.lunar_bloom_damage_bonus",
      label: "C2 警语与北地传说 · 满辉月绽放伤害加成",
      source: { characterId: "Lauma", kind: "character", minimumSourceConstellation: 2 },
      target: "specialReactionDamageBonus",
      targetFilter: { specialReactionKinds: ["lunar_bloom"] },
      value: { kind: "fixed", value: 0.4 }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
      id: "lauma.constellation.6.i_offer_blood_and_tears_to_the_moonlight.lunar_bloom_elevation",
      label: "C6 我将血与泪献予月光 · 满辉月绽放伤害擢升",
      source: { characterId: "Lauma", kind: "character", minimumSourceConstellation: 6 },
      target: "specialReactionElevation",
      targetFilter: { specialReactionKinds: ["lunar_bloom"] },
      value: { kind: "fixed", value: 0.25 }
    }
  ],
  characterId: "Lauma",
  metrics: [
    {
      characterId: "Lauma",
      id: "lauma.burst.pale_hymn.bloom_related_reaction_flat_damage_addition",
      kind: "scalar",
      label: "苍色祷歌 / 绽放、超绽放、烈绽放基础伤害增加值",
      ratioParameter: {
        reference: {
          groupId: "burst",
          id: "bloom-related-reaction-damage-increase",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 2.7776, talentLevel: 1 },
          { expectedValue: 4.99968, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "elementalMastery",
      semantic: "bloom_related_reaction_flat_damage_addition",
      sourceActionId: "lauma.burst.pale_hymn",
      status: "verified",
      target: "friendly_recipient",
      unit: "damage"
    },
    {
      characterId: "Lauma",
      id: "lauma.burst.pale_hymn.lunar_bloom_flat_damage_addition",
      kind: "scalar",
      label: "苍色祷歌 / 月绽放固定伤害增加值",
      ratioParameter: {
        reference: {
          groupId: "burst",
          id: "lunar-bloom-reaction-damage-increase",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 2.2224, talentLevel: 1 },
          { expectedValue: 4.00032, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "elementalMastery",
      semantic: "lunar_bloom_flat_damage_bonus",
      sourceActionId: "lauma.burst.pale_hymn",
      status: "verified",
      target: "friendly_recipient",
      unit: "damage"
    }
  ],
  detail:
    "Runo: Dawnless Rest of Karsikko's press hit and one first normal-attack hit remain verified lower-level C0 attack-scaling Dendro actions, but are not selected support outputs. Pale Hymn adds source Elemental Mastery × burst parameter 2 to one Bloom, Hyperbloom, or Burgeon damage instance after its ordinary reaction calculation and before resistance; the same Burst's parameter 3 adds source Elemental Mastery × its listed coefficient to one Lunar-Bloom instance after the Lunar reaction multipliers and before CRIT. Burst C3 is applied to both parameter lookups. C2 supplies separate additive base-damage increases, while its Ascendant Gleam 40% Lunar-Bloom Damage Bonus remains a distinct reaction-bonus stage. It excludes stack consumption, aura/timing, and rotation behavior.",
  label: laumaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
