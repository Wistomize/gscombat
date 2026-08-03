import type { CharacterCombatCoverage } from "../../combat/types.js"

import { ningguangDefinition } from "./definition.js"

export const ningguangCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      attackKind: "charged",
      characterId: "Ningguang",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "charged-attack-damage",
          id: "charged-attack",
          snapshotChecks: [
            { expectedCoefficient: 1.7408, talentLevel: 1 },
            { expectedCoefficient: 3.13344, talentLevel: 10 }
          ]
        },
        {
          coefficientParameterId: "star-jade-damage",
          id: "star-jade",
          snapshotChecks: [
            { expectedCoefficient: 0.496, talentLevel: 1 },
            { expectedCoefficient: 0.8928, talentLevel: 10 }
          ]
        }
      ],
      element: ningguangDefinition.element,
      evaluator: "declared_direct",
      id: "ningguang.normal.charged_attack.with_star_jades",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-trove-of-marvelous-treasures-geo-damage-bonus",
          kind: "flat",
          label: "固有天赋 · 储之千日，用之一刻",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.12, talentLevel: 1 }],
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "charged-attack-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "auto",
          id: "star-jade-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "passive2",
          id: "a4-trove-of-marvelous-treasures-geo-damage-bonus",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          defaultValue: 3,
          id: "star-jade-count",
          label: "当前星璇数量",
          maximumValue: 3,
          minimumValue: 0
        }
      ],
      status: "verified",
      talentSlot: "normal",
      timeline: {
        damageEvents: [
          { at: 0, damagePartId: "charged-attack", id: "charged-attack", snapshot: "cast" },
          {
            at: 0,
            damagePartId: "star-jade",
            hitCount: { kind: "scenario_parameter", parameterId: "star-jade-count" },
            id: "star-jade",
            snapshot: "cast"
          }
        ],
        duration: 1
      }
    },
    {
      characterId: "Ningguang",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "jade-screen-skill-damage",
          id: "jade-screen-skill-damage",
          snapshotChecks: [
            { expectedCoefficient: 2.304, talentLevel: 1 },
            { expectedCoefficient: 4.1472, talentLevel: 10 }
          ]
        }
      ],
      element: ningguangDefinition.element,
      evaluator: "declared_direct",
      id: "ningguang.skill.jade_screen.skill_damage",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "jade-screen-skill-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Ningguang",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "starshatter-single-star-jade-damage",
          id: "starshatter-single-star-jade",
          snapshotChecks: [
            { expectedCoefficient: 0.8696, talentLevel: 1 },
            { expectedCoefficient: 1.56528, talentLevel: 10 }
          ]
        }
      ],
      element: ningguangDefinition.element,
      evaluator: "declared_direct",
      id: "ningguang.burst.starshatter.single_star_jade",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "starshatter-single-star-jade-damage",
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
      characterId: "Ningguang",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "starshatter-gem-damage",
          id: "starshatter-gem",
          snapshotChecks: [
            { expectedCoefficient: 0.8696, talentLevel: 1 },
            { expectedCoefficient: 1.56528, talentLevel: 10 }
          ]
        }
      ],
      element: ningguangDefinition.element,
      evaluator: "declared_direct",
      id: "ningguang.burst.starshatter.full",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-trove-of-marvelous-treasures-geo-damage-bonus",
          kind: "flat",
          label: "固有天赋 · 储之千日，用之一刻",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.12, talentLevel: 1 }],
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "starshatter-gem-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "passive2",
          id: "a4-trove-of-marvelous-treasures-geo-damage-bonus",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [6, 12],
          defaultValue: 12,
          id: "starshatter-gem-count",
          label: "天权崩玉命中宝石数",
          maximumValue: 12,
          minimumValue: 6
        }
      ],
      status: "verified",
      talentSlot: "burst",
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "starshatter-gem",
            hitCount: { kind: "scenario_parameter", parameterId: "starshatter-gem-count" },
            id: "starshatter-gem",
            snapshot: "cast"
          }
        ],
        duration: 1
      }
    },
    {
      characterId: "Ningguang",
      element: ningguangDefinition.element,
      id: "ningguang.passive.trove_of_marvelous_treasures.geo_damage_bonus",
      kind: "support",
      status: "verified",
      talentSlot: "passive"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "ningguang.passive.trove_of_marvelous_treasures.geo_damage_bonus",
      label: "储之千日，用之一刻 · 岩元素伤害加成",
      source: { characterId: "Ningguang", kind: "character", minimumSourceAscension: 4 },
      target: "damageBonus",
      targetFilter: { elements: ["geo"] },
      value: { kind: "fixed", value: 0.12 }
    }
  ],
  characterId: "Ningguang",
  metrics: [
    {
      actionId: "ningguang.normal.charged_attack.with_star_jades",
      characterId: "Ningguang",
      id: "ningguang.normal.charged_attack.with_star_jades",
      kind: "damage",
      label: "普通攻击·千金掷 / 重击与当前星璇",
      sourceActionId: "ningguang.normal.charged_attack.with_star_jades",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "ningguang.burst.starshatter.full",
      characterId: "Ningguang",
      id: "ningguang.burst.starshatter.full",
      kind: "damage",
      label: "天权崩玉 / 全部命中宝石",
      sourceActionId: "ningguang.burst.starshatter.full",
      status: "verified",
      target: "enemy"
    },
    {
      characterId: "Ningguang",
      flat: 0.12,
      id: "ningguang.passive.trove_of_marvelous_treasures.geo_damage_bonus",
      kind: "scalar",
      label: "储之千日，用之一刻 / 岩元素伤害加成",
      recipientRequirements: [],
      semantic: "damage_bonus",
      sourceActionId: "ningguang.passive.trove_of_marvelous_treasures.geo_damage_bonus",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    }
  ],
  detail:
    "The selected C0 core metric reuses one charged attack: its Geo base hit plus the selected zero to three current Star Jades (default three), sourced from the pinned 6.7 game-data snapshot's auto[1] and auto[2] coefficients. At talent levels one and ten, those coefficients are 1.7408 and 3.13344 for the charged hit, then 0.496 and 0.8928 for each Star Jade. It declares no target aura, elemental application, or reaction. At Ascension 4 or above, the conventional post-Jade-Screen state adds 12% Geo Damage Bonus to both selected self-damage metrics. The three-Jade limit is the C0 Normal Attack limit; normal attacks needed to generate Jades, the A1 stamina waiver, C6's seven post-burst Jades, projectile targeting or travel, timing, and external effects remain unmodeled. Starshatter separately resolves exactly six gems without Jade Screen or twelve with it. Projectile blocking and other state changes remain unmodeled.",
  label: ningguangDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
