import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage } from "../../combat/types.js"

import { citlaliDefinition } from "./definition.js"
import { citlaliCombatEffects } from "./effects.js"

export const citlaliCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("citlali", 7),
    { id: "citlali.kit.retained-shield", label: "白曜护盾保护当前场上角色", kind: "shield", recipient: "on_field", sourceFieldPresence: "any", sustained: true },
    ...declareWeaponHitCapabilities(citlaliDefinition),
    declareHitCapability("citlali.kit.skill_burst_hits", "战技/爆发直接命中准备", ["skill","burst"], ["cryo"]),
    { ...declareHitCapability("citlali.kit.sustained_skill_hits", "可持续造成战技命中", ["skill"], ["cryo"], true, "any"), skillHitOpportunities: { withinSeconds: 7, count: 2, minimumSeparationSeconds: 0.3 }, requiredReactionFamily: "any", requiredReactionCounterpartElements: ["hydro", "pyro"] },
  ],
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
  actionEffects: citlaliCombatEffects,
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
    "The selected support metric calculates one Opal Shield's non-Cryo base absorption delivered to one friendly recipient as Citlali's final Elemental Mastery × skill[1] plus skill[2], before that recipient's Shield Strength; C3 adds three Skill levels. Prepared C1 adds 200% of Citlali's final Elemental Mastery to other on-field characters' normal, charged, plunge, Skill and Burst base damage, assuming an available Stellar Blade for the selected core hit rather than simulating charge consumption. C2 grants Citlali 125 Elemental Mastery at either field position and other protected/followed on-field characters 250; her own 125 also contributes to the shield and C1. With party Cryo plus Hydro/Pyro application, A1 prepares 20% Pyro/Hydro resistance reduction after Frozen/Melt, and C2 adds another 20%; these enemy effects also benefit off-field hits and require A1 to be unlocked. At C6, all lower constellations remain active alongside the maximum forty Secret-Law points: 60% Pyro/Hydro Damage Bonus to party recipients and 100% all-damage bonus to Citlali herself. It excludes the 250% Cryo-damage absorption branch, shield duration and transfer timing, Nightsoul consumption timing, Obsidian Tzitzimitl and Frostfall Storm damage, and A4's Elemental Mastery-to-damage bonuses.",
  label: citlaliDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
