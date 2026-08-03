import type { CharacterCombatCoverage } from "../../combat/types.js"

import { ifaDefinition } from "./definition.js"

export const ifaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Ifa",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.536072, talentLevel: 1 },
            { expectedCoefficient: 0.96493, talentLevel: 10 }
          ]
        }
      ],
      element: ifaDefinition.element,
      evaluator: "declared_direct",
      id: "ifa.normal.auto.first_hit",
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
      characterId: "Ifa",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "airborne-disease-prevention-remedy-bullet-damage",
          id: "airborne-disease-prevention-remedy-bullet",
          snapshotChecks: [
            { expectedCoefficient: 1.3336, talentLevel: 1 },
            { expectedCoefficient: 2.40048, talentLevel: 10 }
          ]
        }
      ],
      element: ifaDefinition.element,
      evaluator: "declared_direct",
      id: "ifa.skill.airborne_disease_prevention.remedy_bullet",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "airborne-disease-prevention-remedy-bullet-damage",
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
      characterId: "Ifa",
      element: ifaDefinition.element,
      id: "ifa.skill.airborne_disease_prevention.remedy_bullet.heal_tick",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "airborne-disease-prevention-remedy-bullet-healing-elemental-mastery-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "airborne-disease-prevention-remedy-bullet-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Ifa",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "compound-field-of-refined-medicine-initial-hit-damage",
          id: "compound-field-of-refined-medicine-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 5.0848, talentLevel: 1 },
            { expectedCoefficient: 9.15264, talentLevel: 10 }
          ]
        }
      ],
      element: ifaDefinition.element,
      evaluator: "declared_direct",
      id: "ifa.burst.compound_field_of_refined_medicine.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "compound-field-of-refined-medicine-initial-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    }
  ],
  characterId: "Ifa",
  metrics: [
    {
      characterId: "Ifa",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "airborne-disease-prevention-remedy-bullet-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 48.14847, talentLevel: 1 },
          { expectedValue: 105.93467, talentLevel: 10 }
        ]
      },
      id: "ifa.skill.airborne_disease_prevention.remedy_bullet.heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "空天疾护 / 秘药弹命中单名队员治疗量",
      percentageParameter: {
        reference: {
          groupId: "skill",
          id: "airborne-disease-prevention-remedy-bullet-healing-elemental-mastery-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.2016, talentLevel: 1 },
          { expectedValue: 0.36288, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "elementalMastery",
      sourceActionId: "ifa.skill.airborne_disease_prevention.remedy_bullet.heal_tick",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "One first normal-attack hit, one Airborne Disease Prevention remedy bullet, and Compound Field of Refined Medicine's initial hit are locked to the pinned 6.7 game-data snapshot from Genshin Optimizer commit 21c98eb60355160274a8c4cecfc5671e2151a073. The selected support metric is one Tonicshot hit's heal for one nearby party member: Ifa's Elemental Mastery × skill[1] plus skill[2], then Ifa's Healing Bonus and that recipient's Incoming Healing Bonus; C3 adds three Skill levels. The Tonicshot heals all nearby party members independently, so this per-recipient value has no fixed current-HP gate. It excludes Tonicshot damage, target count, Nightsoul state and duration, A1 Essentials reaction bonuses, A4's Elemental Mastery bonus, C4, C6, Burst damage, external effects, timing, and all other character states.",
  label: ifaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
