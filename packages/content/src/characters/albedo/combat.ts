import type { CharacterCombatCoverage } from "../../combat/types.js"

import { albedoDefinition } from "./definition.js"

export const albedoCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Albedo",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "transient-blossom-damage",
          id: "transient-blossom",
          snapshotChecks: [
            { expectedCoefficient: 1.336, talentLevel: 1 },
            { expectedCoefficient: 2.4048, talentLevel: 10 }
          ]
        }
      ],
      element: albedoDefinition.element,
      evaluator: "declared_direct",
      id: "albedo.skill.transient_blossom",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "transient-blossom-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "defense",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Albedo",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "rite-of-progeniture-tectonic-tide-initial-hit-damage",
          id: "rite-of-progeniture-tectonic-tide-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 3.672, talentLevel: 1 },
            { expectedCoefficient: 6.6096, talentLevel: 10 }
          ]
        }
      ],
      element: albedoDefinition.element,
      evaluator: "declared_direct",
      id: "albedo.burst.rite_of_progeniture_tectonic_tide.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "rite-of-progeniture-tectonic-tide-initial-hit-damage",
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
      characterId: "Albedo",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "abiogenesis-solar-isotoma-initial-hit-damage",
          id: "abiogenesis-solar-isotoma-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.304, talentLevel: 1 },
            { expectedCoefficient: 2.3472, talentLevel: 10 }
          ]
        }
      ],
      element: albedoDefinition.element,
      evaluator: "declared_direct",
      id: "albedo.skill.abiogenesis_solar_isotoma.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "abiogenesis-solar-isotoma-initial-hit-damage",
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
      characterId: "Albedo",
      element: albedoDefinition.element,
      id: "albedo.passive.homuncular_nature",
      kind: "support",
      status: "verified",
      talentSlot: "passive"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "albedo.passive.homuncular_nature.elemental_mastery_buff",
      label: "瓶中人的天慧 · 队伍元素精通提升",
      source: { characterId: "Albedo", kind: "character", minimumSourceAscension: 4 },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "not_source" },
      value: { kind: "fixed", value: 125 }
    },
    {
      activation: "active",
      id: "albedo.constellation.4.descent_of_divinity.plunge_damage_bonus",
      label: "阳华领域内 · C4 神性之陨：下落攻击伤害加成",
      source: { characterId: "Albedo", kind: "character", minimumSourceConstellation: 4 },
      target: "damageBonus",
      targetFilter: { attackKinds: ["plunge"] },
      value: { kind: "fixed", value: 0.3 }
    }
  ],
  characterId: "Albedo",
  metrics: [
    {
      actionId: "albedo.skill.transient_blossom",
      characterId: "Albedo",
      id: "albedo.skill.transient_blossom",
      kind: "damage",
      label: "创生法·拟造阳华 / 单次刹那之花",
      sourceActionId: "albedo.skill.transient_blossom",
      status: "verified",
      target: "enemy"
    },
    {
      characterId: "Albedo",
      flat: 125,
      id: "albedo.passive.homuncular_nature.elemental_mastery_buff",
      kind: "scalar",
      label: "瓶中人的天慧 / 元素精通提升",
      recipientRequirements: [],
      semantic: "elemental_mastery_buff",
      sourceActionId: "albedo.passive.homuncular_nature",
      status: "verified",
      target: "friendly_recipient",
      unit: "elemental_mastery"
    }
  ],
  detail:
    "The selected profile verifies one Transient Blossom and Homuncular Nature's 125 Elemental Mastery buff as independent outputs. Solar Isotoma deployment and burst initial hit remain verified baseline actions. C4's in-field Plunging Attack damage bonus is an explicit current-action snapshot. The seven Fatal Blossoms, passive HP threshold, constructs, remaining constellations, reactions, timing, and crystallize remain unmodeled.",
  label: albedoDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
