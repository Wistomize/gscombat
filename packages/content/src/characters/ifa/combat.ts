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
  actionEffects: [
    {
      activation: "maximum_reachable",
      condition: { kind: "team_nightsoul_burst", minimumTriggers: 1 },
      id: "ifa.passive.mutual_aid_agreement.after_nightsoul_burst.elemental_mastery",
      label: "固有天赋 · 互助救援协议（夜魂迸发后10秒，元素精通提高）",
      source: { characterId: "Ifa", kind: "character", minimumSourceAscension: 4 },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 80 }
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
    "One first normal-attack hit, one Airborne Disease Prevention remedy bullet, and Compound Field of Refined Medicine's initial hit are locked to the pinned 6.7 game-data snapshot. The selected support metric is one Tonicshot hit's heal for one nearby party member: Ifa's Elemental Mastery × skill[1] plus skill[2], then source Healing Bonus and recipient Incoming Healing Bonus; C3 adds three Skill levels. Mutual Aid Agreement automatically adds 80 Elemental Mastery after a party-reachable Nightsoul Burst and therefore contributes to the heal. Rescue Essentials reaction bonuses, C4, C6, Burst damage, target count, and rotation timing remain unmodeled.",
  label: ifaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
