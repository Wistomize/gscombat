import type { CharacterCombatCoverage } from "../../combat/types.js"

import { escoffierDefinition } from "./definition.js"

export const escoffierCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Escoffier",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "scoring-cut-initial-hit-damage",
          id: "scoring-cut-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 5.928, talentLevel: 1 },
            { expectedCoefficient: 10.6704, talentLevel: 10 }
          ]
        }
      ],
      element: escoffierDefinition.element,
      evaluator: "declared_direct",
      id: "escoffier.burst.scoring_cut.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "scoring-cut-initial-hit-damage",
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
      characterId: "Escoffier",
      element: escoffierDefinition.element,
      id: "escoffier.burst.scoring_cut.party_healing",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "scoring-cut-party-healing-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "scoring-cut-party-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Escoffier",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "low-temperature-cooking-skill-damage",
          id: "low-temperature-cooking-tap-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.504, talentLevel: 1 },
            { expectedCoefficient: 0.9072, talentLevel: 10 }
          ]
        }
      ],
      element: escoffierDefinition.element,
      evaluator: "declared_direct",
      id: "escoffier.skill.low_temperature_cooking.tap_initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "low-temperature-cooking-skill-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    }
  ],
  characterId: "Escoffier",
  metrics: [
    {
      characterId: "Escoffier",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "scoring-cut-party-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 1078.5255, talentLevel: 1 },
          { expectedValue: 2372.936, talentLevel: 10 }
        ]
      },
      id: "escoffier.burst.scoring_cut.party_healing",
      includeHealingBonus: true,
      kind: "healing",
      label: "花刀技法 / 施放全队单名成员治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "scoring-cut-party-healing-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 1.72032, talentLevel: 1 },
          { expectedValue: 3.096576, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "attack",
      sourceActionId: "escoffier.burst.scoring_cut.party_healing",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "Scoring Cut's initial hit and one Low-Temperature Cooking tap initial hit remain verified raw C0 attack-scaling Cryo actions. Escoffier's selected role metric is one nearby party member's Scoring Cut cast healing: Attack × burst[1] + burst[2], then healing bonus, with burst Talent Level +3 at C5. The pinned 6.7 snapshot maps the ratio to 1.72032 at Talent Level 1 and 3.096576 at Level 10, and the flat value to 1078.5255 and 2372.936. It does not model the number of healed teammates, Cooking Mek's passive heal, hold behavior, Hydro/Cryo-only resistance reduction, passives other than C5 talent level, timing, external effects, or other character states.",
  label: escoffierDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
