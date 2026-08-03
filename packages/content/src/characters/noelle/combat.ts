import type { CharacterCombatCoverage } from "../../combat/types.js"

import { noelleDefinition } from "./definition.js"

export const noelleCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Noelle",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "breastplate-damage",
          id: "breastplate",
          snapshotChecks: [
            { expectedCoefficient: 1.6, talentLevel: 1 },
            { expectedCoefficient: 2.88, talentLevel: 10 }
          ]
        }
      ],
      element: noelleDefinition.element,
      evaluator: "declared_direct",
      id: "noelle.skill.breastplate",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "breastplate-damage",
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
      characterId: "Noelle",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "sweeping-time-initial-swing-damage",
          id: "sweeping-time-initial-swing",
          snapshotChecks: [
            { expectedCoefficient: 0.672, talentLevel: 1 },
            { expectedCoefficient: 1.2096, talentLevel: 10 }
          ]
        }
      ],
      element: noelleDefinition.element,
      evaluator: "declared_direct",
      id: "noelle.burst.sweeping_time.initial_swing",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "sweeping-time-initial-swing-damage",
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
      characterId: "Noelle",
      damageKind: "direct",
      damageParts: [
        {
          id: "sweeping-time-normal-hit-one",
          scalingTerms: [
            {
              coefficientParameterId: "sweeping-time-normal-hit-one-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 0.7912, talentLevel: 1 },
                { expectedCoefficient: 1.564, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientMultiplierParameterId: "sweeping-time-defense-to-attack-ratio",
              coefficientMultiplierSnapshotChecks: [
                { expectedCoefficient: 0.4, talentLevel: 1 },
                { expectedCoefficient: 0.72, talentLevel: 10 }
              ],
              coefficientParameterId: "sweeping-time-normal-hit-one-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 0.7912, talentLevel: 1 },
                { expectedCoefficient: 1.564, talentLevel: 10 }
              ],
              stat: "defense"
            }
          ]
        },
        {
          id: "sweeping-time-normal-hit-two",
          scalingTerms: [
            {
              coefficientParameterId: "sweeping-time-normal-hit-two-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 0.73358, talentLevel: 1 },
                { expectedCoefficient: 1.4501, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientMultiplierParameterId: "sweeping-time-defense-to-attack-ratio",
              coefficientMultiplierSnapshotChecks: [
                { expectedCoefficient: 0.4, talentLevel: 1 },
                { expectedCoefficient: 0.72, talentLevel: 10 }
              ],
              coefficientParameterId: "sweeping-time-normal-hit-two-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 0.73358, talentLevel: 1 },
                { expectedCoefficient: 1.4501, talentLevel: 10 }
              ],
              stat: "defense"
            }
          ]
        },
        {
          id: "sweeping-time-normal-hit-three",
          scalingTerms: [
            {
              coefficientParameterId: "sweeping-time-normal-hit-three-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 0.86258, talentLevel: 1 },
                { expectedCoefficient: 1.7051, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientMultiplierParameterId: "sweeping-time-defense-to-attack-ratio",
              coefficientMultiplierSnapshotChecks: [
                { expectedCoefficient: 0.4, talentLevel: 1 },
                { expectedCoefficient: 0.72, talentLevel: 10 }
              ],
              coefficientParameterId: "sweeping-time-normal-hit-three-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 0.86258, talentLevel: 1 },
                { expectedCoefficient: 1.7051, talentLevel: 10 }
              ],
              stat: "defense"
            }
          ]
        },
        {
          id: "sweeping-time-normal-hit-four",
          scalingTerms: [
            {
              coefficientParameterId: "sweeping-time-normal-hit-four-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 1.13434, talentLevel: 1 },
                { expectedCoefficient: 2.2423, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientMultiplierParameterId: "sweeping-time-defense-to-attack-ratio",
              coefficientMultiplierSnapshotChecks: [
                { expectedCoefficient: 0.4, talentLevel: 1 },
                { expectedCoefficient: 0.72, talentLevel: 10 }
              ],
              coefficientParameterId: "sweeping-time-normal-hit-four-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 1.13434, talentLevel: 1 },
                { expectedCoefficient: 2.2423, talentLevel: 10 }
              ],
              stat: "defense"
            }
          ]
        }
      ],
      element: noelleDefinition.element,
      evaluator: "declared_direct",
      id: "noelle.burst.sweeping_time.normal_attack_combo",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "sweeping-time-normal-hit-one-attack-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "auto",
          id: "sweeping-time-normal-hit-two-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "auto",
          id: "sweeping-time-normal-hit-three-attack-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "auto",
          id: "sweeping-time-normal-hit-four-attack-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "burst",
          id: "sweeping-time-defense-to-attack-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "normal",
      timeline: {
        damageEvents: [
          { at: 0, damagePartId: "sweeping-time-normal-hit-one", id: "sweeping-time-normal-hit-one", snapshot: "cast" },
          { at: 0, damagePartId: "sweeping-time-normal-hit-two", id: "sweeping-time-normal-hit-two", snapshot: "cast" },
          { at: 0, damagePartId: "sweeping-time-normal-hit-three", id: "sweeping-time-normal-hit-three", snapshot: "cast" },
          { at: 0, damagePartId: "sweeping-time-normal-hit-four", id: "sweeping-time-normal-hit-four", snapshot: "cast" }
        ],
        duration: 1
      }
    },
    {
      characterId: "Noelle",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.7912, talentLevel: 1 },
            { expectedCoefficient: 1.564, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "noelle.normal.auto.first_hit",
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
      characterId: "Noelle",
      element: noelleDefinition.element,
      id: "noelle.skill.breastplate.support",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "breastplate-healing-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "breastplate-healing-trigger-probability",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "breastplate-shield-ratio",
          parameterIndex: 5,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "breastplate-shield-flat",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "breastplate-healing-flat",
          parameterIndex: 7,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    }
  ],
  characterId: "Noelle",
  metrics: [
    {
      actionId: "noelle.burst.sweeping_time.normal_attack_combo",
      characterId: "Noelle",
      id: "noelle.burst.sweeping_time.normal_attack_combo",
      kind: "damage",
      label: "大扫除 / C0 四段普通攻击",
      sourceActionId: "noelle.burst.sweeping_time.normal_attack_combo",
      status: "verified",
      target: "enemy"
    },
    {
      characterId: "Noelle",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "breastplate-shield-flat",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 769.7851, talentLevel: 1 },
          { expectedValue: 1693.6555, talentLevel: 10 }
        ]
      },
      id: "noelle.skill.breastplate.initial_absorption",
      kind: "scalar",
      label: "护心铠 / 初始吸收量",
      ratioParameter: {
        reference: {
          groupId: "skill",
          id: "breastplate-shield-ratio",
          parameterIndex: 5,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 1.2, talentLevel: 1 },
          { expectedValue: 2.16, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "defense",
      semantic: "shield",
      sourceActionId: "noelle.skill.breastplate.support",
      status: "verified",
      target: "friendly_recipient",
      unit: "hp"
    },
    {
      characterId: "Noelle",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "breastplate-healing-flat",
          parameterIndex: 7,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 102.71802, talentLevel: 1 },
          { expectedValue: 225.99677, talentLevel: 10 }
        ]
      },
      id: "noelle.skill.breastplate.heal",
      includeHealingBonus: true,
      kind: "healing",
      label: "护心铠 / 单次治疗量",
      percentageParameter: {
        reference: {
          groupId: "skill",
          id: "breastplate-healing-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.2128, talentLevel: 1 },
          { expectedValue: 0.38304, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "defense",
      sourceActionId: "noelle.skill.breastplate.support",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      characterId: "Noelle",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "breastplate-healing-trigger-probability",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.5, talentLevel: 1 },
          { expectedValue: 0.59, talentLevel: 10 }
        ]
      },
      id: "noelle.skill.breastplate.healing_trigger_probability",
      kind: "scalar",
      label: "护心铠 / 治疗触发概率",
      recipientRequirements: [],
      semantic: "trigger_probability",
      sourceActionId: "noelle.skill.breastplate.support",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    }
  ],
  detail:
    "The selected support profile verifies Breastplate's initial DEF-scaled shield, one heal, and its talent-level trigger probability, including C3 talent levels. One uninfused normal hit, Breastplate hit, and burst initial swing remain baseline damage actions. Sweeping Time's C0 four-hit Normal Attack uses each Normal Attack ratio plus its burst defense-to-attack conversion. C1 guaranteed healing and C6 conversion remain in progress.",
  label: noelleDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
