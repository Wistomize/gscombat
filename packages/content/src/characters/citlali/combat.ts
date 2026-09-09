import type { CharacterCombatCoverage } from "../../combat/types.js"

import { citlaliDefinition } from "./definition.js"

export const citlaliCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Citlali",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.434072, talentLevel: 1 },
            { expectedCoefficient: 0.78133, talentLevel: 10 }
          ]
        }
      ],
      element: citlaliDefinition.element,
      evaluator: "declared_direct",
      id: "citlali.normal.auto.first_hit",
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
      characterId: "Citlali",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "dawnfrost-darkstar-obsidian-tzitzimitl-damage",
          id: "dawnfrost-darkstar-obsidian-tzitzimitl",
          snapshotChecks: [
            { expectedCoefficient: 0.7296, talentLevel: 1 },
            { expectedCoefficient: 1.31328, talentLevel: 10 }
          ]
        }
      ],
      element: citlaliDefinition.element,
      evaluator: "declared_direct",
      id: "citlali.skill.dawnfrost_darkstar.obsidian_tzitzimitl.deployment",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "dawnfrost-darkstar-obsidian-tzitzimitl-damage",
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
      characterId: "Citlali",
      element: citlaliDefinition.element,
      id: "citlali.skill.dawnfrost_darkstar.opal_shield",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "opal-shield-elemental-mastery-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "opal-shield-flat-absorption",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Citlali",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "edict-of-entwined-splendor-ice-storm-damage",
          id: "edict-of-entwined-splendor-ice-storm",
          snapshotChecks: [
            { expectedCoefficient: 5.376, talentLevel: 1 },
            { expectedCoefficient: 9.6768, talentLevel: 10 }
          ]
        }
      ],
      element: citlaliDefinition.element,
      evaluator: "declared_direct",
      id: "citlali.burst.edict_of_entwined_splendor.ice_storm",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "edict-of-entwined-splendor-ice-storm-damage",
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
      id: "citlali.constellation.6.teoiztac_secret_pact.maximum_secret_law.pyro_hydro_damage_bonus",
      label: "原动天的密契 · C6 秘律之数40点时全队火元素与水元素伤害加成60%",
      source: { characterId: "Citlali", kind: "character", minimumSourceConstellation: 6 },
      target: "damageBonus",
      targetFilter: { elements: ["pyro", "hydro"] },
      value: { kind: "fixed", value: 0.6 }
    },
    {
      activation: "maximum_reachable",
      id: "citlali.constellation.6.teoiztac_secret_pact.maximum_secret_law.self_damage_bonus",
      label: "原动天的密契 · C6 秘律之数40点时茜特菈莉造成的伤害提升100%",
      source: { characterId: "Citlali", kind: "character", minimumSourceConstellation: 6 },
      target: "damageBonus",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 1 }
    }
  ],
  characterId: "Citlali",
  metrics: [
    {
      characterId: "Citlali",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "opal-shield-flat-absorption",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 1386.6759, talentLevel: 1 },
          { expectedValue: 3050.9182, talentLevel: 10 }
        ]
      },
      id: "citlali.skill.dawnfrost_darkstar.opal_shield.base_absorption",
      kind: "scalar",
      label: "霜昼黑星 / 白曜护盾基础吸收量（非冰元素伤害）",
      ratioParameter: {
        reference: {
          groupId: "skill",
          id: "opal-shield-elemental-mastery-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 5.76, talentLevel: 1 },
          { expectedValue: 10.368, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "elementalMastery",
      semantic: "shield",
      sourceActionId: "citlali.skill.dawnfrost_darkstar.opal_shield",
      status: "verified",
      target: "friendly_recipient",
      unit: "hp"
    }
  ],
  detail:
    "The selected support metric calculates one Opal Shield's non-Cryo base absorption delivered to one friendly recipient as Citlali's Elemental Mastery × skill[1] plus skill[2], before that recipient's Shield Strength; C3 adds three Skill levels. At C6, the maximum forty Secret-Law points automatically contribute 60% Pyro and Hydro Damage Bonus to all party recipients and 100% all-damage bonus to Citlali herself; neither bonus changes shield absorption. It excludes the 250% Cryo-damage absorption branch, shield duration and transfer timing, Nightsoul consumption timing, Obsidian Tzitzimitl and Frostfall Storm damage, A1 Pyro/Hydro resistance reduction, A4's Elemental Mastery-to-damage bonuses, C2's Elemental Mastery changes, external effects, and character states.",
  label: citlaliDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
