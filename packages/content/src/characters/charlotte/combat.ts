import type { CharacterCombatCoverage } from "../../combat/types.js"

import { charlotteDefinition } from "./definition.js"

export const charlotteCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Charlotte",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.498456, talentLevel: 1 },
            { expectedCoefficient: 0.897221, talentLevel: 10 }
          ]
        }
      ],
      element: charlotteDefinition.element,
      evaluator: "declared_direct",
      id: "charlotte.normal.auto.first_hit",
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
      characterId: "Charlotte",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "freezing-point-composition-press-damage",
          id: "freezing-point-composition-press",
          snapshotChecks: [
            { expectedCoefficient: 0.672, talentLevel: 1 },
            { expectedCoefficient: 1.2096, talentLevel: 10 }
          ]
        }
      ],
      element: charlotteDefinition.element,
      evaluator: "declared_direct",
      id: "charlotte.skill.framing_freezing_point_composition.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "freezing-point-composition-press-damage",
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
      characterId: "Charlotte",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "still-photo-comprehensive-confirmation-initial-hit-damage",
          id: "still-photo-comprehensive-confirmation-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.77616, talentLevel: 1 },
            { expectedCoefficient: 1.397088, talentLevel: 10 }
          ]
        }
      ],
      element: charlotteDefinition.element,
      evaluator: "declared_direct",
      id: "charlotte.burst.still_photo_comprehensive_confirmation.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-initial-hit-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Charlotte",
      element: charlotteDefinition.element,
      id: "charlotte.burst.still_photo_comprehensive_confirmation.cast_healing",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-cast-healing-attack-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-cast-healing-flat",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Charlotte",
      element: charlotteDefinition.element,
      id: "charlotte.burst.still_photo_comprehensive_confirmation.newsflash_field.heal_tick",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-newsflash-field-heal-tick-attack-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-newsflash-field-heal-tick-flat",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  characterId: "Charlotte",
  metrics: [
    {
      characterId: "Charlotte",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-cast-healing-flat",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 1608.4863, talentLevel: 1 },
          { expectedValue: 3538.9382, talentLevel: 10 }
        ]
      },
      id: "charlotte.burst.still_photo_comprehensive_confirmation.cast_healing",
      includeHealingBonus: true,
      kind: "healing",
      label: "定格·全方位确证 / 施放单名队员治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-cast-healing-attack-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 2.565734, talentLevel: 1 },
          { expectedValue: 4.618322, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受治疗角色为施放时队伍中的附近角色" }
      ],
      scalingStat: "attack",
      sourceActionId: "charlotte.burst.still_photo_comprehensive_confirmation.cast_healing",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      characterId: "Charlotte",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-newsflash-field-heal-tick-flat",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 57.447098, talentLevel: 1 },
          { expectedValue: 126.393196, talentLevel: 10 }
        ]
      },
      id: "charlotte.burst.still_photo_comprehensive_confirmation.newsflash_field.heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "定格·全方位确证 / 「临事场域」单次当前场上角色治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-newsflash-field-heal-tick-attack-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.09216, talentLevel: 1 },
          { expectedValue: 0.165888, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受治疗角色为「临事场域」中的当前场上角色" }
      ],
      scalingStat: "attack",
      sourceActionId: "charlotte.burst.still_photo_comprehensive_confirmation.newsflash_field.heal_tick",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "The selected Charlotte profile reports only her own two Burst healing outputs: one cast heal for a selected nearby party member and one Newsflash Field heal tick for the selected current on-field recipient. The cast heal is Attack × burst[0] plus burst[1], then Charlotte's Healing Bonus and the recipient's Incoming Healing Bonus; the field tick is Attack × burst[3] plus burst[4] and uses the same healing bonuses. The pinned 6.7 snapshot locks cast-heal parameters to 2.565734 and 4.618322 Attack plus 1608.4863 and 3538.9382 at Talent Levels 1 and 10, and field-heal parameters to 0.09216 and 0.165888 Attack plus 57.447098 and 126.393196. C3 adds three Burst levels to both outputs. One first normal-attack hit, one Framing press hit, and Still Photo's initial Cryo hit remain verified lower-level actions rather than selected support metrics. It excludes Newsflash Field damage, field duration and timing, target count, A1/C1/C2/C4/C6 and other passive or constellation effects, elemental application and reactions, external effects, and all other character states.",
  label: charlotteDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
