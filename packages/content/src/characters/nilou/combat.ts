import type { CharacterCombatCoverage } from "../../combat/types.js"

import { nilouDefinition } from "./definition.js"

export const nilouCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Nilou",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "dance-of-abzendegi-first-hit-damage",
          id: "dance-of-abzendegi-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.18432, talentLevel: 1 },
            { expectedCoefficient: 0.331776, talentLevel: 10 }
          ]
        }
      ],
      element: nilouDefinition.element,
      evaluator: "declared_direct",
      id: "nilou.burst.dance_of_abzendegi.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "dance-of-abzendegi-first-hit-damage",
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
      characterId: "Nilou",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "dance-of-haftkarsvar-initial-hit-damage",
          id: "dance-of-haftkarsvar-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.033389, talentLevel: 1 },
            { expectedCoefficient: 0.0601, talentLevel: 10 }
          ]
        }
      ],
      element: nilouDefinition.element,
      evaluator: "declared_direct",
      id: "nilou.skill.dance_of_haftkarsvar.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "dance-of-haftkarsvar-initial-hit-damage",
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
      characterId: "Nilou",
      element: nilouDefinition.element,
      id: "nilou.passive.dreamy_dance_of_aeons.bountiful_core_damage_bonus",
      kind: "support",
      parameterReferences: [
        {
          groupId: "passive2",
          id: "bountiful-core-damage-bonus-per-1000-max-hp",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "bountiful-core-damage-bonus-minimum-max-hp",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "bountiful-core-damage-bonus-maximum",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "passive"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      condition: {
        allowedElements: ["hydro", "dendro"],
        kind: "team_element_subset",
        requiredElements: ["hydro", "dendro"]
      },
      id: "nilou.passive.dreamy_dance_of_aeons.bountiful_core_damage_bonus",
      label: "翩舞永世之梦 · 丰穰之核伤害提升",
      source: { characterId: "Nilou", kind: "character", minimumSourceAscension: 4 },
      target: "reactionDamageBonus",
      targetFilter: { reactionKinds: ["bloom"] },
      value: {
        kind: "final_hp",
        maximumValue: { kind: "fixed", value: 4 },
        multiplier: {
          kind: "talent_parameter",
          multiplier: 0.001,
          parameter: {
            groupId: "passive2",
            id: "bountiful-core-damage-bonus-per-1000-max-hp",
            parameterIndex: 0,
            source: "talent",
            talentSlot: "passive"
          }
        },
        offset: -30000
      }
    }
  ],
  characterId: "Nilou",
  metrics: [
    {
      characterId: "Nilou",
      id: "nilou.passive.dreamy_dance_of_aeons.bountiful_core_damage_bonus",
      kind: "scalar",
      label: "翩舞永世之梦 / 丰穰之核伤害提升",
      maximumValue: 4,
      minimumScalingValue: 30000,
      ratioParameter: {
        reference: {
          groupId: "passive2",
          id: "bountiful-core-damage-bonus-per-1000-max-hp",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        snapshotChecks: [{ expectedValue: 0.09, talentLevel: 1 }],
        valueMultiplier: 0.001
      },
      recipientRequirements: [],
      scalingStat: "hp",
      semantic: "bloom_related_reaction_damage_bonus",
      sourceActionId: "nilou.passive.dreamy_dance_of_aeons.bountiful_core_damage_bonus",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    }
  ],
  detail:
    "Dance of Abzendegi's first hit and Dance of Haftkarsvar's initial Pirouette entry hit remain verified lower-level max-health-scaling Hydro actions, but neither is selected as Nilou's role metric. The selected scalar is Dreamy Dance of Aeons' Bountiful Core damage increase: max(0, Nilou's Max HP - 30,000) × passive2[0] ÷ 1,000, capped at 4. The pinned 6.7 data fixes passive2[0] at 0.09, passive2[1] at 30,000, and passive2[2] at 4, so this is 9% Bountiful Core damage per 1,000 Max HP above 30,000, capped at 400%. The fixed threshold and cap are hand-entered because the scalar schema currently accepts numeric bounds while passive2 references preserve their upstream mapping. Court of Dancing Petals is an explicit usage condition for this metric: the party must contain at least one Hydro and one Dendro character with no other elements, and Nilou must have completed the required Dance of Haftkarsvar step to obtain Golden Chalice's Bounty. The result is a source-owned team scalar, not a calculation of a particular teammate's final damage; it applies only to Bloom damage from the resulting Bountiful Cores, never Hyperbloom or Burgeon. It excludes Bountiful Core trigger ownership, target count, core timing, the separate A1 Elemental Mastery effect, C1/C2/C4/C6, aura and reactions beyond the declared Bountiful Core condition, external buffs, and rotation behavior.",
  label: nilouDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
