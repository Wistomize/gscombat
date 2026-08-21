import type { CharacterCombatCoverage } from "../../combat/types.js"

import { alyoshaDefinition } from "./definition.js"

const huntersPrecisionActionId = "alyosha.skill.thunderstrike_ambush.hunters_precision"
const tugarinHealingActionId = "alyosha.passive.awakening_the_sleeping_treeline.tugarin.healing"
const stellarFrontierActionId = "alyosha.passive.stellar_frontier.stellar_superconduct_damage_bonus"

const huntersPrecisionParameter = {
  reference: {
    groupId: "skill" as const,
    id: "hunters-precision-attack-increase",
    parameterIndex: 4,
    source: "talent" as const,
    talentSlot: "skill" as const
  },
  snapshotChecks: [
    { expectedValue: 0.1166, talentLevel: 1 },
    { expectedValue: 0.212, talentLevel: 10 },
    { expectedValue: 0.25016, talentLevel: 13 }
  ]
} as const

export const alyoshaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Alyosha",
      element: alyoshaDefinition.element,
      id: huntersPrecisionActionId,
      kind: "support",
      parameterReferences: [huntersPrecisionParameter.reference],
      scenarioParameters: [
        {
          defaultValue: 1,
          id: "hunters-precision-stacks",
          label: "猎者之准当前层数",
          maximumValue: 1,
          minimumValue: 1,
          rangeBySourceConstellation: [
            { defaultValue: 2, maximumValue: 2, minimumSourceConstellation: 6 }
          ]
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Alyosha",
      element: alyoshaDefinition.element,
      id: tugarinHealingActionId,
      kind: "support",
      parameterReferences: [
        {
          groupId: "passive1",
          id: "tugarin-active-character-healing-attack-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "passive"
    },
    {
      characterId: "Alyosha",
      element: alyoshaDefinition.element,
      id: stellarFrontierActionId,
      kind: "support",
      status: "verified",
      talentSlot: "passive"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "alyosha.skill.hunters_precision.attack_percent",
      label: "猎者之准 · 攻击力提升",
      source: { characterId: "Alyosha", kind: "character" },
      target: "attackPercent",
      value: { kind: "talent_parameter", parameter: huntersPrecisionParameter.reference }
    },
    {
      activation: "maximum_reachable",
      id: "alyosha.constellation.6.hunters_precision.second_stack.attack_percent",
      label: "复夺旌幡 · C6猎者之准第2层攻击力提升",
      source: { characterId: "Alyosha", kind: "character", minimumSourceConstellation: 6 },
      target: "attackPercent",
      value: { kind: "talent_parameter", parameter: huntersPrecisionParameter.reference }
    },
    {
      activation: "maximum_reachable",
      id: "alyosha.passive.stellar_frontier.active_character.stellar_superconduct_damage_bonus",
      label: "星赴险域 · 场上角色星超导反应伤害提升20%",
      source: { characterId: "Alyosha", kind: "character" },
      target: "specialReactionDamageBonus",
      targetFilter: { specialReactionKinds: ["stellar_superconduct"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "maximum_reachable",
      id: "alyosha.constellation.6.hunters_precision.elemental_mastery",
      label: "复夺旌幡 · C6满2层猎者之准使元素精通提升100点",
      source: { characterId: "Alyosha", kind: "character", minimumSourceConstellation: 6 },
      target: "elementalMastery",
      value: { kind: "fixed", value: 100 }
    }
  ],
  characterId: "Alyosha",
  detail:
    "The selected outputs are Hunter's Precision Attack increase, one Tugarin heal for the current active character, Stellar Frontier's 20% active-character Stellar-Superconduct damage bonus, and C6's 100 Elemental Mastery. Hunter's Precision defaults to one stack. At C6, cumulative C3 raises a configured level-10 Skill to effective level 13 (25.016% per stack), while C6 automatically supplies two stacks for 50.032% total Attack increase. Tugarin healing is Attack × 120% before source Healing Bonus and recipient Incoming Healing Bonus. C4's separate 60% Attack heal for the lowest-HP party member, personal Skill/Burst damage, Energy restoration, field cadence, and mark timing are intentionally not merged into these source-owned indicators.",
  label: alyoshaDefinition.name,
  metrics: [
    {
      characterId: "Alyosha",
      id: "alyosha.skill.hunters_precision.attack_percent",
      kind: "scalar",
      label: "猎者之准 / 攻击力提升",
      ratioParameter: huntersPrecisionParameter,
      ratioScenarioParameter: { parameterId: "hunters-precision-stacks" },
      recipientRequirements: [],
      semantic: "attack_buff",
      sourceActionId: huntersPrecisionActionId,
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    },
    {
      characterId: "Alyosha",
      flat: 0,
      id: "alyosha.passive.tugarin.active_character.healing",
      includeHealingBonus: true,
      kind: "healing",
      label: "图加林 / 单次当前场上角色治疗量",
      percentageParameter: {
        reference: {
          groupId: "passive1",
          id: "tugarin-active-character-healing-attack-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        snapshotChecks: [{ expectedValue: 1.2, talentLevel: 1 }]
      },
      recipientRequirements: [{ kind: "recipient_in_source_area", label: "当前场上角色位于图加林附近" }],
      scalingStat: "attack",
      sourceActionId: tugarinHealingActionId,
      status: "verified",
      target: "friendly_recipient"
    },
    {
      characterId: "Alyosha",
      id: "alyosha.passive.stellar_frontier.active_character.stellar_superconduct_damage_bonus",
      kind: "scalar",
      label: "星赴险域 / 场上角色星超导反应伤害提升",
      ratio: 0.2,
      recipientRequirements: [],
      semantic: "damage_bonus",
      sourceActionId: stellarFrontierActionId,
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    },
    {
      characterId: "Alyosha",
      id: "alyosha.constellation.6.hunters_precision.elemental_mastery",
      flat: 0,
      kind: "scalar",
      label: "复夺旌幡 / C6满2层元素精通提升",
      ratioConstellationBonuses: [{ minimumConstellation: 6, value: 100 }],
      recipientRequirements: [],
      semantic: "elemental_mastery_buff",
      sourceActionId: huntersPrecisionActionId,
      status: "verified",
      target: "friendly_recipient",
      unit: "elemental_mastery"
    }
  ],
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
