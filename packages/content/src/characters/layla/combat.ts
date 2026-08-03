import type { CharacterCombatCoverage } from "../../combat/types.js"

import { laylaDefinition } from "./definition.js"

export const laylaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Layla",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "nights-of-formal-focus-skill-damage",
          id: "nights-of-formal-focus-skill-damage",
          snapshotChecks: [
            { expectedCoefficient: 0.128, talentLevel: 1 },
            { expectedCoefficient: 0.2304, talentLevel: 10 }
          ]
        }
      ],
      element: laylaDefinition.element,
      evaluator: "declared_direct",
      id: "layla.skill.nights_of_formal_focus.skill_damage",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "nights-of-formal-focus-skill-damage",
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
      characterId: "Layla",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.512173, talentLevel: 1 },
            { expectedCoefficient: 1.012435, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "layla.normal.auto.first_hit",
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
      characterId: "Layla",
      element: laylaDefinition.element,
      id: "layla.skill.nights_of_formal_focus.curtain_of_slumber",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "curtain-of-slumber-shield-hp-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "curtain-of-slumber-shield-flat-absorption",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    }
  ],
  characterId: "Layla",
  metrics: [
    {
      characterId: "Layla",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "curtain-of-slumber-shield-flat-absorption",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 1040.007, talentLevel: 1 },
          { expectedValue: 2288.1887, talentLevel: 10 }
        ]
      },
      id: "layla.skill.nights_of_formal_focus.curtain_of_slumber.initial_absorption",
      kind: "scalar",
      label: "垂裳端凝之夜 / 安眠帷幕基础护盾吸收量（C0、非冰元素伤害）",
      ratioParameter: {
        reference: {
          groupId: "skill",
          id: "curtain-of-slumber-shield-hp-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.108, talentLevel: 1 },
          { expectedValue: 0.1944, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "hp",
      semantic: "shield",
      sourceActionId: "layla.skill.nights_of_formal_focus.curtain_of_slumber",
      status: "verified",
      target: "friendly_recipient",
      unit: "hp"
    }
  ],
  detail:
    "Nights of Formal Focus's baseline C0 attack-scaling Cryo hit and one uninfused Physical normal first hit remain verified lower-level actions, but neither is selected as a display metric: Layla's role-correct output here is her shield. The selected C0 support metric calculates one Curtain of Slumber's non-Cryo base absorption delivered to one friendly recipient as max HP × skill[2] plus skill[3], before that recipient's Shield Strength; C3 adds three Skill levels. It excludes the 250% Cryo-damage absorption branch, C1's whole-shield absorption increase, shield duration and self-Cryo application; Night Star stacks, Shooting Stars, and every resulting action sequence; Dream of the Star-Stream Shaker's Starlight Slugs and generated Night Stars; elemental infusions, timing, passives, other constellations, external effects, and other character states.",
  label: laylaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
