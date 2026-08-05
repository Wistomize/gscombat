import type { CharacterCombatCoverage } from "../../combat/types.js"

import { illugaDefinition } from "./definition.js"

export const illugaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Illuga",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.473662, talentLevel: 1 },
            { expectedCoefficient: 0.936309, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "illuga.normal.auto.first_hit",
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
      characterId: "Illuga",
      damageKind: "direct",
      damageParts: [
        {
          id: "dawnbearing-songbird-press",
          scalingTerms: [
            {
              coefficientParameterId: "dawnbearing-songbird-press-elemental-mastery-ratio",
              snapshotChecks: [
                { expectedCoefficient: 4.8256, talentLevel: 1 },
                { expectedCoefficient: 8.68608, talentLevel: 10 }
              ],
              stat: "elementalMastery"
            },
            {
              coefficientParameterId: "dawnbearing-songbird-press-defense-ratio",
              snapshotChecks: [
                { expectedCoefficient: 2.4128, talentLevel: 1 },
                { expectedCoefficient: 4.34304, talentLevel: 10 }
              ],
              stat: "defense"
            }
          ]
        }
      ],
      element: illugaDefinition.element,
      evaluator: "declared_direct",
      id: "illuga.skill.dawnbearing_songbird.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "dawnbearing-songbird-press-elemental-mastery-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "dawnbearing-songbird-press-defense-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Illuga",
      damageKind: "direct",
      damageParts: [
        {
          id: "nightbird-song-cast",
          scalingTerms: [
            {
              coefficientParameterId: "nightbird-song-cast-elemental-mastery-ratio",
              snapshotChecks: [
                { expectedCoefficient: 8.272, talentLevel: 1 },
                { expectedCoefficient: 14.8896, talentLevel: 10 }
              ],
              stat: "elementalMastery"
            },
            {
              coefficientParameterId: "nightbird-song-cast-defense-ratio",
              snapshotChecks: [
                { expectedCoefficient: 4.136, talentLevel: 1 },
                { expectedCoefficient: 7.4448, talentLevel: 10 }
              ],
              stat: "defense"
            }
          ]
        }
      ],
      element: illugaDefinition.element,
      evaluator: "declared_direct",
      id: "illuga.burst.song_of_the_nightbird.cast_damage",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "nightbird-song-cast-elemental-mastery-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "nightbird-song-cast-defense-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Illuga",
      element: illugaDefinition.element,
      id: "illuga.burst.song_of_the_nightbird.bonus_pool",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "nightbird-song-geo-damage-bonus-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "nightbird-song-lunar-crystallize-bonus-ratio",
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
      id: "illuga.passive.lightkeepers_oath.geo.crit_rate",
      label: "铸灯者的盟约 · 执灯之誓（岩元素伤害暴击率提高5%）",
      source: { characterId: "Illuga", kind: "character", minimumSourceAscension: 1 },
      target: "critRate",
      targetFilter: { elements: ["geo"], recipientSourceRelation: "not_source" },
      value: { kind: "fixed", value: 0.05 }
    },
    {
      activation: "maximum_reachable",
      id: "illuga.passive.lightkeepers_oath.geo.crit_damage",
      label: "铸灯者的盟约 · 执灯之誓（岩元素伤害暴击伤害提高10%）",
      source: { characterId: "Illuga", kind: "character", minimumSourceAscension: 1 },
      target: "critDamage",
      targetFilter: { elements: ["geo"], recipientSourceRelation: "not_source" },
      value: { kind: "fixed", value: 0.1 }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
      id: "illuga.passive.lightkeepers_oath.full_moonsign.elemental_mastery",
      label: "铸灯者的盟约 · 满辉执灯之誓（元素精通提高50点）",
      source: { characterId: "Illuga", kind: "character", minimumSourceAscension: 1 },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "not_source" },
      value: { kind: "fixed", value: 50 }
    },
    {
      activation: "maximum_reachable",
      id: "illuga.constellation.4.active_character.defense",
      label: "逐日之狼 · C4 魇夜的莺歌期间当前场上角色防御力提高200点",
      source: { characterId: "Illuga", kind: "character", minimumSourceConstellation: 4 },
      target: "defenseFlat",
      targetFilter: { recipientSourceRelation: "not_source" },
      value: { kind: "fixed", value: 200 }
    },
    {
      activation: "maximum_reachable",
      id: "illuga.constellation.6.lightkeepers_oath.geo.extra_crit_rate",
      label: "魇夜之莺 · C6 执灯之誓额外岩元素伤害暴击率提高5%",
      source: { characterId: "Illuga", kind: "character", minimumSourceConstellation: 6 },
      target: "critRate",
      targetFilter: { elements: ["geo"], recipientSourceRelation: "not_source" },
      value: { kind: "fixed", value: 0.05 }
    },
    {
      activation: "maximum_reachable",
      id: "illuga.constellation.6.lightkeepers_oath.geo.extra_crit_damage",
      label: "魇夜之莺 · C6 执灯之誓额外岩元素伤害暴击伤害提高20%",
      source: { characterId: "Illuga", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: { elements: ["geo"], recipientSourceRelation: "not_source" },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
      id: "illuga.constellation.6.lightkeepers_oath.full_moonsign.extra_elemental_mastery",
      label: "魇夜之莺 · C6 满辉执灯之誓额外元素精通提高30点",
      source: { characterId: "Illuga", kind: "character", minimumSourceConstellation: 6 },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "not_source" },
      value: { kind: "fixed", value: 30 }
    },
    {
      activation: "maximum_reachable",
      id: "illuga.burst.song_of_the_nightbird.single_geo_damage_bonus",
      label: "夜莺之歌 · 单次岩元素伤害增加值",
      source: { characterId: "Illuga", kind: "character" },
      target: "baseDamageFlat",
      targetFilter: { elements: ["geo"] },
      value: {
        kind: "final_elemental_mastery",
        multiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "burst",
            id: "nightbird-song-geo-damage-bonus-ratio",
            parameterIndex: 2,
            source: "talent",
            talentSlot: "burst"
          }
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "illuga.burst.song_of_the_nightbird.single_lunar_crystallize_bonus",
      label: "夜莺之歌 · 单次月结晶伤害增加值",
      source: { characterId: "Illuga", kind: "character" },
      target: "specialReactionFlatDamageAddition",
      targetFilter: { specialReactionKinds: ["lunar_crystallize"] },
      value: {
        kind: "final_elemental_mastery",
        multiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "burst",
            id: "nightbird-song-lunar-crystallize-bonus-ratio",
            parameterIndex: 3,
            source: "talent",
            talentSlot: "burst"
          }
        }
      }
    },
    {
      activation: "maximum_reachable",
      condition: { elements: ["geo", "hydro"], kind: "team_element_count", maximum: 1, minimum: 1 },
      exclusivity: { group: "illuga-passive-lunar-crystallize-tier", variant: "one-character" },
      id: "illuga.passive.hunters_dusk.lunar_crystallize.one_character",
      label: "狩魔者的黄昏 · 1名水/岩元素角色（月结晶额外增加叶洛亚元素精通的48%）",
      source: { characterId: "Illuga", kind: "character", minimumSourceAscension: 4 },
      target: "specialReactionFlatDamageAddition",
      targetFilter: { recipientSourceRelation: "not_source", specialReactionKinds: ["lunar_crystallize"] },
      value: { kind: "final_elemental_mastery", multiplier: { kind: "fixed", value: 0.48 } }
    },
    {
      activation: "maximum_reachable",
      condition: { elements: ["geo", "hydro"], kind: "team_element_count", maximum: 2, minimum: 2 },
      exclusivity: { group: "illuga-passive-lunar-crystallize-tier", variant: "two-characters" },
      id: "illuga.passive.hunters_dusk.lunar_crystallize.two_characters",
      label: "狩魔者的黄昏 · 2名水/岩元素角色（月结晶额外增加叶洛亚元素精通的96%）",
      source: { characterId: "Illuga", kind: "character", minimumSourceAscension: 4 },
      target: "specialReactionFlatDamageAddition",
      targetFilter: { recipientSourceRelation: "not_source", specialReactionKinds: ["lunar_crystallize"] },
      value: { kind: "final_elemental_mastery", multiplier: { kind: "fixed", value: 0.96 } }
    },
    {
      activation: "maximum_reachable",
      condition: { elements: ["geo", "hydro"], kind: "team_element_count", minimum: 3 },
      exclusivity: { group: "illuga-passive-lunar-crystallize-tier", variant: "three-or-more-characters" },
      id: "illuga.passive.hunters_dusk.lunar_crystallize.three_or_more_characters",
      label: "狩魔者的黄昏 · 3名及以上水/岩元素角色（月结晶额外增加叶洛亚元素精通的160%）",
      source: { characterId: "Illuga", kind: "character", minimumSourceAscension: 4 },
      target: "specialReactionFlatDamageAddition",
      targetFilter: { recipientSourceRelation: "not_source", specialReactionKinds: ["lunar_crystallize"] },
      value: { kind: "final_elemental_mastery", multiplier: { kind: "fixed", value: 1.6 } }
    }
  ],
  characterId: "Illuga",
  metrics: [
    {
      characterId: "Illuga",
      id: "illuga.burst.song_of_the_nightbird.single_geo_damage_bonus",
      kind: "scalar",
      label: "夜莺之歌 / 单次岩元素伤害增加值",
      ratioParameter: {
        reference: {
          groupId: "burst",
          id: "nightbird-song-geo-damage-bonus-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.336, talentLevel: 1 },
          { expectedValue: 0.6048, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "elementalMastery",
      semantic: "geo_damage_flat_bonus",
      sourceActionId: "illuga.burst.song_of_the_nightbird.bonus_pool",
      status: "verified",
      target: "friendly_recipient",
      unit: "damage"
    },
    {
      characterId: "Illuga",
      id: "illuga.burst.song_of_the_nightbird.single_lunar_crystallize_bonus",
      kind: "scalar",
      label: "夜莺之歌 / 单次月结晶伤害增加值",
      ratioParameter: {
        reference: {
          groupId: "burst",
          id: "nightbird-song-lunar-crystallize-bonus-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 2.2592, talentLevel: 1 },
          { expectedValue: 4.06656, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "elementalMastery",
      semantic: "lunar_crystallize_flat_damage_bonus",
      sourceActionId: "illuga.burst.song_of_the_nightbird.bonus_pool",
      status: "verified",
      target: "friendly_recipient",
      unit: "damage"
    },
    {
      actionId: "illuga.burst.song_of_the_nightbird.cast_damage",
      characterId: "Illuga",
      id: "illuga.burst.song_of_the_nightbird.cast_damage",
      kind: "damage",
      label: "夜莺之歌 / 施放伤害",
      sourceActionId: "illuga.burst.song_of_the_nightbird.cast_damage",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The selected profile verifies Nightbird's Song's Elemental-Mastery-plus-DEF cast damage and its separate source-Elemental-Mastery-scaled bonuses for one Geo hit and one Lunar-Crystallize hit. Lightkeeper's Oath applies its Geo Crit Rate/Crit DMG and Full-Moonsign Elemental Mastery to nearby teammates; C6 raises those totals to 10%/30% and 80 EM, while C4 supplies 200 flat DEF. Hunter's Dusk adds the reviewed 48%/96%/160% source-EM Lunar-Crystallize tier. Song pool consumption, hold aiming, timing, and rotations remain in progress.",
  label: illugaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
