import type { CharacterCombatCoverage } from "../../combat/types.js"

import { jeanDefinition } from "./definition.js"

export const jeanCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Jean",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "dandelion-breeze-initial-hit-damage",
          id: "dandelion-breeze-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 4.248, talentLevel: 1 },
            { expectedCoefficient: 7.6464, talentLevel: 10 }
          ]
        }
      ],
      element: jeanDefinition.element,
      evaluator: "declared_direct",
      id: "jean.burst.dandelion_breeze.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "dandelion-breeze-initial-hit-damage",
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
      characterId: "Jean",
      element: jeanDefinition.element,
      id: "jean.burst.dandelion_breeze.party_healing",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "dandelion-breeze-party-healing-attack-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "dandelion-breeze-party-healing-flat",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Jean",
      element: jeanDefinition.element,
      id: "jean.burst.dandelion_breeze.field_heal_tick",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "dandelion-breeze-field-heal-attack-ratio",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "dandelion-breeze-field-heal-flat",
          parameterIndex: 5,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Jean",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "gale-blade-press-damage",
          id: "gale-blade-press",
          snapshotChecks: [
            { expectedCoefficient: 2.92, talentLevel: 1 },
            { expectedCoefficient: 5.256, talentLevel: 10 }
          ]
        }
      ],
      element: jeanDefinition.element,
      evaluator: "declared_direct",
      id: "jean.skill.gale_blade.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "gale-blade-press-damage",
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
      characterId: "Jean",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.48332, talentLevel: 1 },
            { expectedCoefficient: 0.9554, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "jean.normal.auto.first_hit",
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
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "jean.constellation.4.lands_of_dandelion.anemo_resistance_shred",
      label: "蒲公英之风领域内 · C4 蒲公英的国土（风元素抗性降低，40%）",
      source: { characterId: "Jean", kind: "character", minimumSourceConstellation: 4 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["anemo"] },
      value: { kind: "fixed", value: 0.4 }
    }
  ],
  characterId: "Jean",
  metrics: [
    {
      characterId: "Jean",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "dandelion-breeze-party-healing-flat",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 1540.3248, talentLevel: 1 },
          { expectedValue: 3388.9717, talentLevel: 10 }
        ]
      },
      id: "jean.burst.dandelion_breeze.party_healing",
      includeHealingBonus: true,
      kind: "healing",
      label: "蒲公英之风 / 施放全队单名成员治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "dandelion-breeze-party-healing-attack-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 2.512, talentLevel: 1 },
          { expectedValue: 4.5216, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "attack",
      sourceActionId: "jean.burst.dandelion_breeze.party_healing",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      characterId: "Jean",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "dandelion-breeze-field-heal-flat",
          parameterIndex: 5,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 154.03249, talentLevel: 1 },
          { expectedValue: 338.89716, talentLevel: 10 }
        ]
      },
      id: "jean.burst.dandelion_breeze.field_heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "蒲公英之风 / 蒲公英领域单跳治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "dandelion-breeze-field-heal-attack-ratio",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.2512, talentLevel: 1 },
          { expectedValue: 0.45216, talentLevel: 10 }
        ]
      },
      recipientRequirements: [{ kind: "recipient_in_source_area", label: "受治疗角色位于蒲公英领域内" }],
      scalingStat: "attack",
      sourceActionId: "jean.burst.dandelion_breeze.field_heal_tick",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "Dandelion Breeze's initial hit, its entry-and-exit hit, one initial Gale Blade press hit, and one uninfused normal first hit remain verified lower-level baseline actions, but none is selected as Jean's support output. The selected cast-healing metric applies separately to each party member with no range or current-HP requirement: Jean's Attack × burst[2] + burst[3], then Jean's Healing Bonus and the selected recipient's Incoming Healing Bonus; burst[2] is 2.512 at Talent Level 1 and 4.5216 at Level 10, while burst[3] is 1540.3248 and 3388.9717. The selected field metric is one healing tick for a recipient inside Dandelion Field: Jean's Attack × burst[4] + burst[5], then the same healing modifiers; burst[4] is 0.2512 and 0.45216, while burst[5] is 154.03249 and 338.89716. C3 adds three Burst levels to both metrics. C4's Anemo resistance reduction is an explicit current-action snapshot for an Anemo action while the Dandelion Field exists; it does not infer Burst casting, field creation, duration, or timing. The metrics emit no damage or reaction event and exclude party-size aggregation, field duration and tick count, entry-and-exit damage, self-cleansing, normal-attack healing, passive energy restoration, external infusions, C1/C2/C5/C6, external effects, timing, and all other character states.",
  label: jeanDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
