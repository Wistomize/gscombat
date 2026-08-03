import type { CharacterCombatCoverage } from "../../combat/types.js"

import { baizhuDefinition } from "./definition.js"

export const baizhuCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Baizhu",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.373704, talentLevel: 1 },
            { expectedCoefficient: 0.672667, talentLevel: 10 }
          ]
        }
      ],
      element: baizhuDefinition.element,
      evaluator: "declared_direct",
      id: "baizhu.normal.auto.first_hit",
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
      characterId: "Baizhu",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "gossamer-sprite-initial-hit-damage",
          id: "gossamer-sprite-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.792, talentLevel: 1 },
            { expectedCoefficient: 1.4256, talentLevel: 10 }
          ]
        }
      ],
      element: baizhuDefinition.element,
      evaluator: "declared_direct",
      id: "baizhu.skill.universal_diagnosis.gossamer_sprite.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "gossamer-sprite-initial-hit-damage",
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
      characterId: "Baizhu",
      element: baizhuDefinition.element,
      id: "baizhu.skill.universal_diagnosis.gossamer_sprite.returning_heal",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "gossamer-sprite-returning-healing-percentage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "gossamer-sprite-returning-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Baizhu",
      element: baizhuDefinition.element,
      id: "baizhu.burst.holistic_revivification.seamless_shield",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "seamless-shield-hp-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "seamless-shield-flat-absorption",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "baizhu.constellation.4.ancient_art_of_perception.holistic_revivification.party_elemental_mastery",
      label: "法古观冥 · C4 施放愈气全形论后（附近队伍角色元素精通提高80点，15秒）",
      source: { characterId: "Baizhu", kind: "character", minimumSourceConstellation: 4 },
      target: "elementalMastery",
      value: { kind: "fixed", value: 80 }
    }
  ],
  characterId: "Baizhu",
  metrics: [
    {
      characterId: "Baizhu",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "gossamer-sprite-returning-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 770.3755, talentLevel: 1 },
          { expectedValue: 1694.9546, talentLevel: 10 }
        ]
      },
      id: "baizhu.skill.universal_diagnosis.gossamer_sprite.returning_heal",
      includeHealingBonus: true,
      kind: "healing",
      label: "太素诊要 / 游丝徵灵返回单跳治疗量",
      percentageParameter: {
        reference: {
          groupId: "skill",
          id: "gossamer-sprite-returning-healing-percentage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.08, talentLevel: 1 },
          { expectedValue: 0.144, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        {
          kind: "recipient_in_source_area",
          label: "受治疗角色为游丝徵灵返回时的附近队伍成员"
        }
      ],
      scalingStat: "hp",
      sourceActionId: "baizhu.skill.universal_diagnosis.gossamer_sprite.returning_heal",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      characterId: "Baizhu",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "seamless-shield-flat-absorption",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 77.03752, talentLevel: 1 },
          { expectedValue: 169.4954, talentLevel: 10 }
        ]
      },
      id: "baizhu.burst.holistic_revivification.seamless_shield.initial_absorption",
      kind: "scalar",
      label: "愈气全形论 / 无郤气护盾基础吸收量（C0、非草元素伤害、当前场上角色）",
      ratioParameter: {
        reference: {
          groupId: "burst",
          id: "seamless-shield-hp-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.008, talentLevel: 1 },
          { expectedValue: 0.0144, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "hp",
      semantic: "shield",
      sourceActionId: "baizhu.burst.holistic_revivification.seamless_shield",
      status: "verified",
      target: "friendly_recipient",
      unit: "hp"
    }
  ],
  detail:
    "One first normal-attack hit and one initial Universal Diagnosis Gossamer Sprite hit remain verified baseline C0 attack-scaling Dendro actions for lower-level calculation, but neither is a selected display metric because Baizhu's role-correct outputs here are his healing and shield. The selected support metric calculates one returning Gossamer Sprite heal as max HP × skill[1] plus skill[2], then source Healing Bonus and recipient Incoming Healing Bonus, for a nearby party member when the Sprite returns; C5 adds three Skill levels. The selected shield metric calculates one Seamless Shield applied to the current active party member as non-Dendro base absorption max HP × burst[0] plus burst[1], before that recipient's Shield Strength; C3 adds three Burst levels. At C4, a separately selected current-action snapshot means Holistic Revivification was already cast and the evaluated recipient is nearby: all nearby party members gain 80 Elemental Mastery for 15 seconds. It does not infer the cast, distance, duration, or a rotation. It otherwise excludes additional Sprite attacks, Shield refreshes, the 250% Dendro-damage absorption branch, Spiritvein attacks, burst healing, reaction bonus, external infusions, remaining passives and constellations, external effects, and other character states.",
  label: baizhuDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
