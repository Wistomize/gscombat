import type { CharacterCombatCoverage } from "../../combat/types.js"

import { chevreuseDefinition } from "./definition.js"

export const chevreuseCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Chevreuse",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "explosive-shell-damage",
          id: "explosive-shell",
          snapshotChecks: [
            { expectedCoefficient: 3.6816, talentLevel: 1 },
            { expectedCoefficient: 6.62688, talentLevel: 10 }
          ]
        }
      ],
      element: chevreuseDefinition.element,
      evaluator: "declared_direct",
      id: "chevreuse.burst.ring_of_bursting_grenades.explosive_shell",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "explosive-shell-damage",
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
      characterId: "Chevreuse",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "short-range-rapid-interdiction-fire-press-damage",
          id: "short-range-rapid-interdiction-fire-press",
          snapshotChecks: [
            { expectedCoefficient: 1.152, talentLevel: 1 },
            { expectedCoefficient: 2.0736, talentLevel: 10 }
          ]
        }
      ],
      element: chevreuseDefinition.element,
      evaluator: "declared_direct",
      id: "chevreuse.skill.short_range_rapid_interdiction_fire.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "short-range-rapid-interdiction-fire-press-damage",
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
      characterId: "Chevreuse",
      element: chevreuseDefinition.element,
      id: "chevreuse.passive.vertical_force_coordination.attack_buff",
      kind: "support",
      parameterReferences: [
        {
          groupId: "passive2",
          id: "vertical-force-coordination-attack-bonus-per-1000-hp",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "vertical-force-coordination-attack-bonus-cap",
          parameterIndex: 2,
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
      condition: {
        allowedElements: ["pyro", "electro"],
        kind: "team_element_subset",
        requiredElements: ["pyro", "electro"]
      },
      id: "chevreuse.passive.vertical_force_coordination.attack_bonus",
      label: "纵阵武力统筹 · 火雷角色攻击力提升",
      source: { characterId: "Chevreuse", kind: "character", minimumSourceAscension: 4 },
      target: "attackPercent",
      targetFilter: { elements: ["pyro", "electro"] },
      value: {
        kind: "final_hp",
        maximumValue: { kind: "fixed", value: 0.4 },
        multiplier: {
          kind: "talent_parameter",
          multiplier: 0.001,
          parameter: {
            groupId: "passive2",
            id: "vertical-force-coordination-attack-bonus-per-1000-hp",
            parameterIndex: 0,
            source: "talent",
            talentSlot: "passive"
          }
        }
      }
    }
  ],
  characterId: "Chevreuse",
  metrics: [
    {
      characterId: "Chevreuse",
      id: "chevreuse.passive.vertical_force_coordination.attack_bonus",
      kind: "scalar",
      label: "纵阵武力统筹 / 火雷角色攻击力提升",
      maximumValue: 0.4,
      ratioParameter: {
        reference: {
          groupId: "passive2",
          id: "vertical-force-coordination-attack-bonus-per-1000-hp",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        snapshotChecks: [{ expectedValue: 0.01, talentLevel: 1 }],
        valueMultiplier: 0.001
      },
      recipientRequirements: [],
      scalingStat: "hp",
      semantic: "attack_buff",
      sourceActionId: "chevreuse.passive.vertical_force_coordination.attack_buff",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    }
  ],
  detail:
    "One Ring of Bursting Grenades explosive grenade hit and one Short-Range Rapid Interdiction Fire press hit remain verified baseline C0 attack-scaling Pyro actions for lower-level calculation, but neither is a selected metric because Chevreuse's role-defining output is her support effect. The selected metric calculates Vertical Force Coordination's Attack bonus after an Overcharged Ball from the held Skill hits: Chevreuse's max HP × (passive2[0] ÷ 1,000), capped at passive2[2], or max HP × 0.00001 capped at 40%. It is available only after Ascension 4, requires a party made entirely of Pyro and Electro characters, and affects nearby Pyro or Electro party members for 30 seconds; the displayed recipient is manually selected and its element eligibility is declared here rather than inferred from a current main DPS. C3 raises Skill level and C5 raises Burst level, but neither changes this passive metric. The model excludes A1's Pyro/Electro Resistance reduction, Skill healing, C6's healing-triggered Pyro/Electro Damage Bonus, reactions, timing, external effects, and other character states.",
  label: chevreuseDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
