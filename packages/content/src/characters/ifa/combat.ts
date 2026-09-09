import type { CharacterCombatCoverage } from "../../combat/types.js"

import { ifaDefinition } from "./definition.js"

export const ifaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      attackKind: "normal",
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
      attackKind: "normal",
      characterId: "Ifa",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "airborne-disease-prevention-remedy-bullet-damage",
          id: "supporting-fire-held-remedy-bullet",
          snapshotChecks: [
            { expectedCoefficient: 1.3336, talentLevel: 1 },
            { expectedCoefficient: 2.40048, talentLevel: 10 }
          ]
        }
      ],
      element: ifaDefinition.element,
      evaluator: "declared_direct",
      id: "ifa.skill.airborne_disease_prevention.supporting_fire.held_remedy_bullet",
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
    },
    {
      activation: "automatic",
      id: "ifa.constellation.6.promise_of_shelter.held_supporting_fire.additional_remedy_bullet",
      label: "羽结所庇的诺言 · C6 长按援护射击额外秘药弹（50%概率，120%攻击力风元素伤害）",
      source: { characterId: "Ifa", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: ["ifa.skill.airborne_disease_prevention.supporting_fire.held_remedy_bullet"],
        attackKinds: ["normal"],
        recipientSourceRelation: "source"
      },
      value: {
        attackKind: "normal",
        canCrit: true,
        coefficient: { kind: "fixed", value: 1.2 },
        element: ifaDefinition.element,
        expectedTriggerProbability: 0.5,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack",
        talentSlot: "skill"
      }
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
    },
    {
      actionId: "ifa.skill.airborne_disease_prevention.supporting_fire.held_remedy_bullet",
      characterId: "Ifa",
      id: "ifa.skill.airborne_disease_prevention.supporting_fire.held_remedy_bullet",
      kind: "damage",
      label: "空天疾护 / 长按援护射击秘药弹（C6额外秘药弹期望伤害）",
      sourceActionId: "ifa.skill.airborne_disease_prevention.supporting_fire.held_remedy_bullet",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit, one Airborne Disease Prevention remedy bullet, and Compound Field of Refined Medicine's initial hit are locked to the pinned 7.0 game-data snapshot. The selected support metric is one Tonicshot hit's heal for one nearby party member: Ifa's Elemental Mastery × skill[1] plus skill[2], then source Healing Bonus and recipient Incoming Healing Bonus; C3 adds three Skill levels. Mutual Aid Agreement automatically adds 80 Elemental Mastery after a party-reachable Nightsoul Burst and therefore contributes to the heal. The held Supporting Fire action is one Normal-Attack-category Remedy Bullet using skill[0]. At C6 only, it includes its separate 50%-probability 120%-Attack Anemo Remedy Bullet as an independent expected-damage event; no target aura or reaction is presumed. Its out-of-combat Nightsoul and Phlogiston consumption reduction has no combat calculation stage. Rescue Essentials reaction bonuses, C4, Burst damage, target count, and rotation timing remain unmodeled.",
  label: ifaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
