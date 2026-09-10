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
    },
    {
      characterId: "Layla",
      damageKind: "direct",
      damageParts: [
        {
          id: "shooting-star",
          scalingTerms: [
            {
              coefficientParameterId: "shooting-star-attack-damage",
              snapshotChecks: [
                { expectedCoefficient: 0.1472, talentLevel: 1 },
                { expectedCoefficient: 0.26496, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "a4-shooting-star-max-hp-additive-damage",
              minimumSourceAscension: 4,
              snapshotChecks: [{ expectedCoefficient: 0.015, talentLevel: 1 }],
              stat: "hp"
            }
          ]
        }
      ],
      element: laylaDefinition.element,
      evaluator: "declared_direct",
      id: "layla.skill.nights_of_formal_focus.shooting_star.single_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "shooting-star-attack-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "passive2",
          id: "a4-shooting-star-max-hp-additive-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Layla",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "starlight-slug-damage",
          id: "starlight-slug",
          snapshotChecks: [
            { expectedCoefficient: 0.046488, talentLevel: 1 },
            { expectedCoefficient: 0.083678, talentLevel: 10 }
          ]
        }
      ],
      element: laylaDefinition.element,
      evaluator: "declared_direct",
      id: "layla.burst.dream_of_the_star_stream_shaker.starlight_slug.single_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "starlight-slug-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "automatic",
      id: "layla.constellation.6.radiant_soulfire.shooting_star.damage_bonus",
      label: "曜光灵炬 · C6 垂裳端凝之夜的飞星伤害提高40%",
      source: { characterId: "Layla", kind: "character", minimumSourceConstellation: 6 },
      target: "damageBonus",
      targetFilter: {
        actionIds: ["layla.skill.nights_of_formal_focus.shooting_star.single_hit"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.4 }
    },
    {
      activation: "automatic",
      id: "layla.constellation.6.radiant_soulfire.starlight_slug.damage_bonus",
      label: "曜光灵炬 · C6 星流摇床之梦的星光弹伤害提高40%",
      source: { characterId: "Layla", kind: "character", minimumSourceConstellation: 6 },
      target: "damageBonus",
      targetFilter: {
        actionIds: ["layla.burst.dream_of_the_star_stream_shaker.starlight_slug.single_hit"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.4 }
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
      shieldAbsorptionMultipliers: [
        { label: "寐领围垣 · C1 安眠帷幕整体伤害吸收量提高20%", minimumSourceConstellation: 1, value: 1.2 }
      ],
      label: "垂裳端凝之夜 / 安眠帷幕基础护盾吸收量（非冰元素伤害）",
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
    },
    {
      actionId: "layla.skill.nights_of_formal_focus.shooting_star.single_hit",
      characterId: "Layla",
      id: "layla.skill.nights_of_formal_focus.shooting_star.single_hit",
      kind: "damage",
      label: "垂裳端凝之夜 / 单枚飞星伤害（含勿扰沉眠、无反应）",
      sourceActionId: "layla.skill.nights_of_formal_focus.shooting_star.single_hit",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "layla.burst.dream_of_the_star_stream_shaker.starlight_slug.single_hit",
      characterId: "Layla",
      id: "layla.burst.dream_of_the_star_stream_shaker.starlight_slug.single_hit",
      kind: "damage",
      label: "星流摇床之梦 / 单枚星光弹伤害（无反应）",
      sourceActionId: "layla.burst.dream_of_the_star_stream_shaker.starlight_slug.single_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "Nights of Formal Focus's baseline attack-scaling Cryo hit and one Physical normal hit remain lower-level actions. Curtain of Slumber's non-Cryo base absorption is max HP × skill[2] plus skill[3]; C1 multiplies the whole base shield by 1.2 before recipient Shield Strength, and C3 adds three Skill levels. Shooting Star uses Attack × skill[1] plus A4's 1.5% max-HP additive term. Starlight Slug instead uses max HP × burst[0], with C5's three Burst levels. At C6, each selected projectile gains 40% Damage Bonus. Faster Night Star generation changes frequency, not either single-hit result. The Cryo absorption branch, shield duration, repeated projectile counts, infusions, and rotation timing are not inferred.",
  label: laylaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
