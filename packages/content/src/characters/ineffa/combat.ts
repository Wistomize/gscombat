import type { CharacterCombatCoverage } from "../../combat/types.js"

import { ineffaDefinition } from "./definition.js"

export const ineffaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Ineffa",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.348352, talentLevel: 1 },
            { expectedCoefficient: 0.688602, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "ineffa.normal.auto.first_hit",
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
      characterId: "Ineffa",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "cleaning-mode-carrier-frequency-skill-damage",
          id: "cleaning-mode-carrier-frequency-skill-damage",
          snapshotChecks: [
            { expectedCoefficient: 0.864, talentLevel: 1 },
            { expectedCoefficient: 1.5552, talentLevel: 10 }
          ]
        }
      ],
      element: ineffaDefinition.element,
      evaluator: "declared_direct",
      id: "ineffa.skill.cleaning_mode_carrier_frequency.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "cleaning-mode-carrier-frequency-skill-damage",
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
      characterId: "Ineffa",
      element: ineffaDefinition.element,
      id: "ineffa.skill.cleaning_mode_carrier_frequency.optical_flow_shield",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "optical-flow-shield-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "optical-flow-shield-flat-absorption",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Ineffa",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "supreme-instruction-cyclonic-exterminator-initial-hit-damage",
          id: "supreme-instruction-cyclonic-exterminator-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 6.768, talentLevel: 1 },
            { expectedCoefficient: 12.1824, talentLevel: 10 }
          ]
        }
      ],
      element: ineffaDefinition.element,
      evaluator: "declared_direct",
      id: "ineffa.burst.supreme_instruction_cyclonic_exterminator.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "supreme-instruction-cyclonic-exterminator-initial-hit-damage",
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
  characterId: "Ineffa",
  metrics: [
    {
      characterId: "Ineffa",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "optical-flow-shield-flat-absorption",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 1386.6759, talentLevel: 1 },
          { expectedValue: 3050.9182, talentLevel: 10 }
        ]
      },
      id: "ineffa.skill.cleaning_mode_carrier_frequency.optical_flow_shield.initial_absorption",
      kind: "scalar",
      label: "净化模式·载波频率 / 光流护盾基础吸收量",
      ratioParameter: {
        reference: {
          groupId: "skill",
          id: "optical-flow-shield-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 2.21184, talentLevel: 1 },
          { expectedValue: 3.981312, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "attack",
      semantic: "shield",
      sourceActionId: "ineffa.skill.cleaning_mode_carrier_frequency.optical_flow_shield",
      status: "verified",
      target: "friendly_recipient",
      unit: "hp"
    }
  ],
  detail:
    "One first normal-attack hit, one Cleaning Mode: Carrier Frequency initial single instance of AoE Electro damage, and Supreme Instruction: Cyclonic Exterminator's initial hit remain verified lower-level C0 attack-scaling actions from the pinned 6.7 Genshin Optimizer snapshot at commit 21c98eb60355160274a8c4cecfc5671e2151a073, but none is selected as Ineffa's display output. The selected support metric calculates one Optical Flow Shield delivered to the current active friendly recipient as total Attack × skill[1] plus skill[2], before that recipient's Shield Strength; C3 adds three Skill levels. It excludes the 250% Electro-damage absorption branch, duration, Birgitta's field and later discharges, Lunar-Charged and every Lunar-Charged damage bonus, passives, constellations other than C3, direct damage, reactions, external effects, timing, and other character states.",
  label: ineffaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
