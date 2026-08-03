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
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "lauma.burst.pale_hymn.bloom_related_reaction_damage_bonus",
      label: "苍色祷歌 · 绽放相关反应伤害提升",
      source: { characterId: "Lauma", kind: "character" },
      target: "reactionDamageBonus",
      targetFilter: { reactionKinds: ["bloom", "hyperbloom", "burgeon"] },
      value: {
        kind: "final_elemental_mastery",
        multiplier: {
          kind: "talent_parameter",
          multiplier: 0.01,
          parameter: {
            groupId: "burst",
            id: "bloom-related-reaction-damage-increase",
            parameterIndex: 2,
            source: "talent",
            talentSlot: "burst"
          }
        }
      }
    }
  ],
  characterId: "Lauma",
  metrics: [
    {
      characterId: "Lauma",
      id: "lauma.burst.pale_hymn.bloom_related_reaction_damage_bonus",
      kind: "scalar",
      label: "苍色祷歌 / 绽放、超绽放、烈绽放反应伤害提升",
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
        ],
        valueMultiplier: 0.01
      },
      recipientRequirements: [],
      scalingStat: "elementalMastery",
      semantic: "bloom_related_reaction_damage_bonus",
      sourceActionId: "lauma.burst.pale_hymn",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    }
  ],
  detail:
    "Runo: Dawnless Rest of Karsikko's press hit and one first normal-attack hit remain verified lower-level C0 attack-scaling Dendro actions, but are not selected support outputs. Pale Hymn exposes its Bloom, Hyperbloom, and Burgeon reaction damage bonus as source Elemental Mastery × burst parameter 2 × 0.01, with burst C3 applied. It excludes Lunar-Bloom, resistance reduction, C2's separate bonus, aura/timing, and rotation behavior.",
  label: laumaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
