import type { CharacterCombatCoverage } from "../../combat/types.js"

import { iansanDefinition } from "./definition.js"

export const iansanCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Iansan",
      element: iansanDefinition.element,
      id: "iansan.burst.the_three_principles_of_power.kinetic_scale.high_nightsoul_attack_buff",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "kinetic-scale-high-attack-conversion",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "kinetic-scale-attack-bonus-cap",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Iansan",
      element: iansanDefinition.element,
      id: "iansan.burst.the_three_principles_of_power.kinetic_scale.low_nightsoul_attack_buff",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "kinetic-scale-low-attack-conversion-per-nightsoul-point",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "kinetic-scale-attack-bonus-cap",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scenarioParameters: [
        {
          defaultValue: 41,
          id: "current-nightsoul-points",
          label: "当前夜魂值（1–41点）",
          maximumValue: 41,
          minimumValue: 1
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Iansan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.469758, talentLevel: 1 },
            { expectedCoefficient: 0.928591, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "iansan.normal.auto.first_hit",
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
      characterId: "Iansan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "thunderbolt-rush-damage",
          id: "thunderbolt-rush",
          snapshotChecks: [
            { expectedCoefficient: 2.864, talentLevel: 1 },
            { expectedCoefficient: 5.1552, talentLevel: 10 }
          ]
        }
      ],
      element: iansanDefinition.element,
      evaluator: "declared_direct",
      id: "iansan.skill.thunderbolt_rush.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "thunderbolt-rush-damage",
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
      characterId: "Iansan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "the-three-principles-of-power-initial-stomp-damage",
          id: "the-three-principles-of-power-initial-stomp",
          snapshotChecks: [
            { expectedCoefficient: 4.304, talentLevel: 1 },
            { expectedCoefficient: 7.7472, talentLevel: 10 }
          ]
        }
      ],
      element: iansanDefinition.element,
      evaluator: "declared_direct",
      id: "iansan.burst.the_three_principles_of_power.initial_stomp",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "the-three-principles-of-power-initial-stomp-damage",
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
      id: "iansan.burst.the_three_principles_of_power.kinetic_scale.high_nightsoul_attack_bonus",
      label: "动能标度 · 高夜魂值攻击力提升",
      source: { characterId: "Iansan", kind: "character" },
      target: "flatAttack",
      value: {
        kind: "source_final_attack",
        maximumValue: {
          kind: "talent_parameter",
          parameter: {
            groupId: "burst",
            id: "kinetic-scale-attack-bonus-cap",
            parameterIndex: 3,
            source: "talent",
            talentSlot: "burst"
          }
        },
        multiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "burst",
            id: "kinetic-scale-high-attack-conversion",
            parameterIndex: 1,
            source: "talent",
            talentSlot: "burst"
          }
        }
      }
    },
    {
      activation: "active",
      id: "iansan.constellation.2.no_laziness_in_fitness.standard_action.off_field.attack_percent",
      label: "偷懒是健身大忌！ · C2 标准动作期间伊安珊处于后台（场上角色攻击力提高30%）",
      source: { characterId: "Iansan", kind: "character", minimumSourceConstellation: 2 },
      target: "attackPercent",
      targetFilter: { recipientSourceRelation: "not_source" },
      value: { kind: "fixed", value: 0.3 }
    }
  ],
  characterId: "Iansan",
  metrics: [
    {
      characterId: "Iansan",
      id: "iansan.burst.the_three_principles_of_power.kinetic_scale.high_nightsoul_attack_bonus",
      kind: "scalar",
      label: "力量三原则 / 动能标度攻击力提升（夜魂值≥42）",
      maximumValueParameter: {
        reference: {
          groupId: "burst",
          id: "kinetic-scale-attack-bonus-cap",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 330, talentLevel: 1 },
          { expectedValue: 690, talentLevel: 10 }
        ]
      },
      ratioParameter: {
        reference: {
          groupId: "burst",
          id: "kinetic-scale-high-attack-conversion",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.27, talentLevel: 1 },
          { expectedValue: 0.27, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "attack",
      semantic: "attack_buff",
      sourceActionId: "iansan.burst.the_three_principles_of_power.kinetic_scale.high_nightsoul_attack_buff",
      status: "verified",
      target: "friendly_recipient",
      unit: "attack"
    },
    {
      characterId: "Iansan",
      id: "iansan.burst.the_three_principles_of_power.kinetic_scale.low_nightsoul_attack_bonus",
      kind: "scalar",
      label: "力量三原则 / 动能标度攻击力提升（夜魂值1–41）",
      maximumValueParameter: {
        reference: {
          groupId: "burst",
          id: "kinetic-scale-attack-bonus-cap",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 330, talentLevel: 1 },
          { expectedValue: 690, talentLevel: 10 }
        ]
      },
      ratioParameter: {
        reference: {
          groupId: "burst",
          id: "kinetic-scale-low-attack-conversion-per-nightsoul-point",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.005, talentLevel: 1 },
          { expectedValue: 0.005, talentLevel: 10 }
        ]
      },
      ratioScenarioParameter: { parameterId: "current-nightsoul-points" },
      recipientRequirements: [],
      scalingStat: "attack",
      semantic: "attack_buff",
      sourceActionId: "iansan.burst.the_three_principles_of_power.kinetic_scale.low_nightsoul_attack_buff",
      status: "verified",
      target: "friendly_recipient",
      unit: "attack"
    }
  ],
  detail:
    "One first normal-attack hit, one Thunderbolt Rush initial hit, and The Three Principles of Power's initial stomp remain verified lower-level C0 attack-scaling damage actions from the pinned 6.7 Genshin Optimizer snapshot at commit 21c98eb60355160274a8c4cecfc5671e2151a073, but none is selected as Iansan's display output. The selected support metrics calculate Kinetic Scale's Attack bonus for one friendly recipient from Iansan's current Attack before the recipient's own modifiers: at Night Soul value 42 or above, Attack × burst[1]; at 1–41, Attack × burst[2] × the explicitly hand-filled current Night Soul value. Both branches are capped by burst[3], and C5 adds three Burst levels. C2 is a manual snapshot after Iansan has cast Burst, Standard Action remains active, and she is off field; it grants 30% Attack only to the evaluated on-field teammate. The active recipient, Kinetic Scale duration, Night Soul recovery and consumption, A1/C6 effects, the Burst's direct damage, reactions, external effects, and rotation behavior remain outside these source-owned outputs.",
  label: iansanDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
