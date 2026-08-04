import type { CharacterCombatCoverage } from "../../combat/types.js"

import { escoffierDefinition } from "./definition.js"

export const escoffierCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Escoffier",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "scoring-cut-initial-hit-damage",
          id: "scoring-cut-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 5.928, talentLevel: 1 },
            { expectedCoefficient: 10.6704, talentLevel: 10 }
          ]
        }
      ],
      element: escoffierDefinition.element,
      evaluator: "declared_direct",
      id: "escoffier.burst.scoring_cut.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "scoring-cut-initial-hit-damage",
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
      characterId: "Escoffier",
      element: escoffierDefinition.element,
      id: "escoffier.burst.scoring_cut.party_healing",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "scoring-cut-party-healing-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "scoring-cut-party-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Escoffier",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "low-temperature-cooking-skill-damage",
          id: "low-temperature-cooking-tap-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.504, talentLevel: 1 },
            { expectedCoefficient: 0.9072, talentLevel: 10 }
          ]
        }
      ],
      element: escoffierDefinition.element,
      evaluator: "declared_direct",
      id: "escoffier.skill.low_temperature_cooking.tap_initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "low-temperature-cooking-skill-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    }
  ],
  actionEffects: [
    {
      activation: "automatic",
      condition: { elements: ["cryo", "hydro"], kind: "team_element_count", minimum: 1 },
      id: "escoffier.passive.better_than_medicine.cryo_hydro_resistance_reduction.first_member",
      label: "美食胜过良药 · 战技或爆发命中后的12秒内（第1名水/冰角色）冰/水元素抗性降低",
      source: { characterId: "Escoffier", kind: "character", minimumSourceAscension: 4 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["cryo", "hydro"] },
      value: { kind: "fixed", value: 0.05 }
    },
    {
      activation: "automatic",
      condition: { elements: ["cryo", "hydro"], kind: "team_element_count", minimum: 2 },
      id: "escoffier.passive.better_than_medicine.cryo_hydro_resistance_reduction.second_member",
      label: "美食胜过良药 · 战技或爆发命中后的12秒内（第2名水/冰角色）冰/水元素抗性降低",
      source: { characterId: "Escoffier", kind: "character", minimumSourceAscension: 4 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["cryo", "hydro"] },
      value: { kind: "fixed", value: 0.05 }
    },
    {
      activation: "automatic",
      condition: { elements: ["cryo", "hydro"], kind: "team_element_count", minimum: 3 },
      id: "escoffier.passive.better_than_medicine.cryo_hydro_resistance_reduction.third_member",
      label: "美食胜过良药 · 战技或爆发命中后的12秒内（第3名水/冰角色）冰/水元素抗性降低",
      source: { characterId: "Escoffier", kind: "character", minimumSourceAscension: 4 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["cryo", "hydro"] },
      value: { kind: "fixed", value: 0.05 }
    },
    {
      activation: "automatic",
      condition: { elements: ["cryo", "hydro"], kind: "team_element_count", minimum: 4 },
      id: "escoffier.passive.better_than_medicine.cryo_hydro_resistance_reduction.fourth_member",
      label: "美食胜过良药 · 战技或爆发命中后的12秒内（第4名水/冰角色）冰/水元素抗性降低",
      source: { characterId: "Escoffier", kind: "character", minimumSourceAscension: 4 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["cryo", "hydro"] },
      value: { kind: "fixed", value: 0.4 }
    }
  ],
  characterId: "Escoffier",
  metrics: [
    {
      characterId: "Escoffier",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "scoring-cut-party-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 1078.5255, talentLevel: 1 },
          { expectedValue: 2372.936, talentLevel: 10 }
        ]
      },
      id: "escoffier.burst.scoring_cut.party_healing",
      includeHealingBonus: true,
      kind: "healing",
      label: "花刀技法 / 施放全队单名成员治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "scoring-cut-party-healing-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 1.72032, talentLevel: 1 },
          { expectedValue: 3.096576, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "attack",
      sourceActionId: "escoffier.burst.scoring_cut.party_healing",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "Scoring Cut's initial hit and one Low-Temperature Cooking tap initial hit remain verified raw C0 attack-scaling Cryo actions. Escoffier's selected role metric is one nearby party member's Scoring Cut cast healing: Attack × burst[1] + burst[2], then healing bonus, with burst Talent Level +3 at C5. The pinned 6.7 snapshot maps the ratio to 1.72032 at Talent Level 1 and 3.096576 at Level 10, and the flat value to 1078.5255 and 2372.936. Better than Medicine is automatically resolved as the current 12-second window after Low-Temperature Cooking or Scoring Cut hits: each configured Hydro or Cryo party member contributes its cumulative 5%/5%/5%/40% tier, reducing eligible Hydro and Cryo resistance by 5%/10%/15%/55%. It does not model the number of healed teammates, Cooking Mek's passive heal, hold behavior, timing, external effects, or other character states.",
  label: escoffierDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
