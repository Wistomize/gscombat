import type { CharacterCombatCoverage } from "../../combat/types.js"

import { linneaDefinition } from "./definition.js"

export const linneaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Linnea",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.589969, talentLevel: 1 },
            { expectedCoefficient: 1.166217, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "linnea.normal.auto.first_hit",
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
      characterId: "Linnea",
      element: linneaDefinition.element,
      id: "linnea.burst.desperate_survival_guide.healing",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "initial-healing-flat",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "initial-healing-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "continuous-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "continuous-healing-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Linnea",
      element: linneaDefinition.element,
      id: "linnea.passive.field_observation_notes",
      kind: "support",
      status: "verified",
      talentSlot: "passive"
    },
    {
      characterId: "Linnea",
      element: linneaDefinition.element,
      id: "linnea.passive.adventure_is_all_about_courage",
      kind: "support",
      parameterReferences: [
        {
          groupId: "passive2",
          id: "defense-to-elemental-mastery-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "passive"
    },
    {
      characterId: "Linnea",
      element: linneaDefinition.element,
      id: "linnea.passive.moonsign_blessing.habitat_survey",
      kind: "support",
      parameterReferences: [
        {
          groupId: "passive3",
          id: "lunar-crystallize-base-damage-bonus-per-defense",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive3",
          id: "lunar-crystallize-base-damage-bonus-maximum",
          parameterIndex: 1,
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
      id: "linnea.passive.geo_resistance_reduction.base",
      label: "野外观察手记 · 岩元素抗性降低",
      source: { characterId: "Linnea", kind: "character" },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["geo"] },
      value: { kind: "fixed", value: 0.15 }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
      id: "linnea.passive.geo_resistance_reduction.full_moonsign",
      label: "野外观察手记 · 满辉额外岩元素抗性降低",
      source: { characterId: "Linnea", kind: "character" },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["geo"] },
      value: { kind: "fixed", value: 0.15 }
    },
    {
      activation: "maximum_reachable",
      id: "linnea.passive.defense_to_elemental_mastery",
      label: "冒险就是要勇气！· 当前角色元素精通提升",
      source: { characterId: "Linnea", kind: "character", minimumSourceAscension: 4 },
      target: "elementalMastery",
      targetFilter: { specialReactionKinds: ["lunar_bloom", "lunar_charged", "lunar_crystallize"] },
      value: {
        kind: "source_final_defense",
        multiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "passive2",
            id: "defense-to-elemental-mastery-ratio",
            parameterIndex: 0,
            source: "talent",
            talentSlot: "passive"
          }
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "linnea.passive.lunar_crystallize_base_damage_bonus",
      label: "月兆祝赐·栖居调研 · 月结晶基础伤害加成",
      source: { characterId: "Linnea", kind: "character" },
      target: "specialReactionBaseDamageBonus",
      targetFilter: { specialReactionKinds: ["lunar_crystallize"] },
      value: {
        kind: "source_final_defense",
        maximumValue: {
          kind: "talent_parameter",
          parameter: {
            groupId: "passive3",
            id: "lunar-crystallize-base-damage-bonus-maximum",
            parameterIndex: 1,
            source: "talent",
            talentSlot: "passive"
          }
        },
        multiplier: {
          kind: "talent_parameter",
          multiplier: 0.01,
          parameter: {
            groupId: "passive3",
            id: "lunar-crystallize-base-damage-bonus-per-defense",
            parameterIndex: 0,
            source: "talent",
            talentSlot: "passive"
          }
        }
      }
    }
  ],
  characterId: "Linnea",
  metrics: [
    {
      characterId: "Linnea",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "initial-healing-flat",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 770.3755, talentLevel: 1 },
          { expectedValue: 1694.9546, talentLevel: 10 }
        ]
      },
      id: "linnea.burst.initial_team_healing",
      includeHealingBonus: true,
      kind: "healing",
      label: "绝境生存指南 / 首次单人治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "initial-healing-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 1.6, talentLevel: 1 },
          { expectedValue: 2.88, talentLevel: 10 }
        ]
      },
      recipientRequirements: [{ kind: "recipient_in_source_area", label: "受治疗角色位于露米附近" }],
      scalingStat: "defense",
      sourceActionId: "linnea.burst.desperate_survival_guide.healing",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      characterId: "Linnea",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "continuous-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 154.0751, talentLevel: 1 },
          { expectedValue: 338.9909, talentLevel: 10 }
        ]
      },
      id: "linnea.burst.continuous_healing_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "绝境生存指南 / 单次持续治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "continuous-healing-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.32, talentLevel: 1 },
          { expectedValue: 0.576, talentLevel: 10 }
        ]
      },
      recipientRequirements: [{ kind: "recipient_in_source_area", label: "当前场上角色位于露米附近" }],
      scalingStat: "defense",
      sourceActionId: "linnea.burst.desperate_survival_guide.healing",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      characterId: "Linnea",
      flat: 0.15,
      id: "linnea.passive.geo_resistance_reduction.base",
      kind: "scalar",
      label: "野外观察手记 / 岩元素抗性降低",
      semantic: "resistance_reduction",
      sourceActionId: "linnea.passive.field_observation_notes",
      status: "verified",
      target: "enemy",
      unit: "ratio"
    },
    {
      characterId: "Linnea",
      flat: 0.3,
      id: "linnea.passive.geo_resistance_reduction.full_moonsign",
      kind: "scalar",
      label: "野外观察手记 / 满辉岩元素抗性降低",
      semantic: "resistance_reduction",
      sourceActionId: "linnea.passive.field_observation_notes",
      status: "verified",
      target: "enemy",
      unit: "ratio"
    },
    {
      characterId: "Linnea",
      id: "linnea.passive.defense_to_elemental_mastery",
      kind: "scalar",
      label: "冒险就是要勇气！/ 当前角色元素精通提升",
      minimumSourceAscension: 4,
      ratioParameter: {
        reference: {
          groupId: "passive2",
          id: "defense-to-elemental-mastery-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        snapshotChecks: [{ expectedValue: 0.05, talentLevel: 1 }]
      },
      recipientRequirements: [],
      recipientTargetRouting: "active_recipient_if_moonsign_else_self",
      scalingStat: "defense",
      semantic: "elemental_mastery_buff",
      sourceActionId: "linnea.passive.adventure_is_all_about_courage",
      status: "verified",
      target: "friendly_recipient",
      unit: "elemental_mastery"
    },
    {
      characterId: "Linnea",
      id: "linnea.passive.lunar_crystallize_base_damage_bonus",
      kind: "scalar",
      label: "月兆祝赐·栖居调研 / 月结晶基础伤害加成",
      maximumValueParameter: {
        reference: {
          groupId: "passive3",
          id: "lunar-crystallize-base-damage-bonus-maximum",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        },
        snapshotChecks: [{ expectedValue: 0.14, talentLevel: 1 }]
      },
      ratioParameter: {
        reference: {
          groupId: "passive3",
          id: "lunar-crystallize-base-damage-bonus-per-defense",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        snapshotChecks: [{ expectedValue: 0.007, talentLevel: 1 }],
        valueMultiplier: 0.01
      },
      recipientRequirements: [],
      scalingStat: "defense",
      semantic: "lunar_crystallize_base_damage_bonus",
      sourceActionId: "linnea.passive.moonsign_blessing.habitat_survey",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    }
  ],
  detail:
    "The selected support profile verifies initial party healing, one continuous on-field healing tick, separate base/full-Moonsign Geo resistance reduction, and the ascension-4 DEF-scaled Elemental Mastery allocation. That allocation routes to the active recipient only when it has Moonsign, otherwise back to Linnea herself. It also exposes the separately capped DEF-derived Lunar-Crystallize base-damage ratio from passive3. No infusion is modeled; Lume's three attacks, Lunar-Crystallize damage, constellations, reactions, timing, and states remain in progress.",
  label: linneaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
