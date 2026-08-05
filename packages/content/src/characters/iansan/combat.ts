import type { CharacterCombatCoverage } from "../../combat/types.js"

import { iansanDefinition } from "./definition.js"

export const iansanCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Iansan",
      element: iansanDefinition.element,
      id: "iansan.passive.kinetic_energy_gradient_test.warming_up.heal_tick",
      kind: "support",
      parameterReferences: [
        {
          groupId: "passive2",
          id: "warming-up-healing-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "passive"
    },
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
      condition: { kind: "source_nightsoul_blessing", required: true },
      id: "iansan.passive.enhanced_resistance_training.precise_movement.attack_percent",
      label: "固有天赋 · 强化抗阻训练（精准走位期间，攻击力提高20%）",
      source: { characterId: "Iansan", kind: "character", minimumSourceAscension: 1 },
      target: "attackPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.2 }
    },
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
      flat: 0,
      id: "iansan.passive.kinetic_energy_gradient_test.warming_up.heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "固有天赋 · 动能梯度测试 / 夜魂迸发后恢复夜魂值触发的单次治疗量",
      percentageParameter: {
        reference: {
          groupId: "passive2",
          id: "warming-up-healing-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        },
        snapshotChecks: [{ expectedValue: 0.6, talentLevel: 1 }]
      },
      recipientRequirements: [],
      scalingStat: "attack",
      sourceActionId: "iansan.passive.kinetic_energy_gradient_test.warming_up.heal_tick",
      status: "verified",
      target: "friendly_recipient"
    },
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
    "The selected support metrics calculate Kinetic Scale's Attack bonus for one friendly recipient from Iansan's current Attack: at 42 or more Nightsoul points, Attack × burst[1]; at 1–41, Attack × burst[2] × the hand-filled current Nightsoul value, capped by burst[3]. Enhanced Resistance Training automatically adds 20% Attack during the maximum-reachable Precise Movement state. Kinetic Energy Gradient Test also exposes one Warming Up heal after a reachable Nightsoul Burst: Iansan's Attack × passive2[1] (60%). C5 adds three Burst levels, while C2 remains a selected off-field 30% Attack snapshot. Repeated healing cadence, Nightsoul consumption, C6, and rotation timing remain outside these source-owned outputs.",
  label: iansanDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
