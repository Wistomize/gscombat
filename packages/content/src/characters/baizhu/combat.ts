import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage } from "../../combat/types.js"

import { baizhuDefinition } from "./definition.js"

export const baizhuCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("baizhu", 3),
    { ...declareSkillCastCapability("baizhu", 3, {"initialUses":2}), id: "baizhu.kit.extra-skill-charge", minimumSourceConstellation: 1 },
    { id: "baizhu.kit.retained-shield", label: "无郤气护盾保护当前场上角色", kind: "shield", recipient: "on_field", sourceFieldPresence: "any", sustained: true },
    ...declareWeaponHitCapabilities(baizhuDefinition),
    declareHitCapability("baizhu.kit.skill_burst_hits", "战技/爆发直接命中准备", ["skill","burst"], ["dendro"]),
  ],
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
    },
    {
      characterId: "Baizhu",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "spiritvein-skill-damage",
          id: "c6-gossamer-sprite-seamless-shield-spiritvein",
          snapshotChecks: [
            { expectedCoefficient: 0.97064, talentLevel: 1 },
            { expectedCoefficient: 1.747152, talentLevel: 10 }
          ]
        }
      ],
      element: baizhuDefinition.element,
      evaluator: "declared_direct",
      id: "baizhu.constellation.6.radical_vitality.gossamer_sprite.seamless_shield.spiritvein",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "spiritvein-skill-damage",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-gossamer-sprite-seamless-shield-spiritvein-current",
          label: "C6 真邪合离：游丝徵灵命中产生无郤气护盾并触发灵气脉",
          maximumValue: 0,
          minimumValue: 0,
          rangeBySourceConstellation: [
            { defaultValue: 1, maximumValue: 1, minimumSourceConstellation: 6, minimumValue: 1 }
          ]
        }
      ],
      status: "verified",
      talentSlot: "burst",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "c6-gossamer-sprite-seamless-shield-spiritvein-current",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-gossamer-sprite-seamless-shield-spiritvein",
            id: "c6-gossamer-sprite-seamless-shield-spiritvein",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
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
    },
    {
      activation: "automatic",
      id: "baizhu.constellation.6.radical_vitality.spiritvein.max_hp_additive_damage",
      label: "真邪合离 · C6 灵气脉伤害追加白术生命值上限的8%",
      source: { characterId: "Baizhu", kind: "character", minimumSourceConstellation: 6 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: ["baizhu.constellation.6.radical_vitality.gossamer_sprite.seamless_shield.spiritvein"],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 0.08 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "hp"
      }
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
      label: "愈气全形论 / 无郤气护盾基础吸收量（非草元素伤害、当前场上角色）",
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
    },
    {
      actionId: "baizhu.constellation.6.radical_vitality.gossamer_sprite.seamless_shield.spiritvein",
      characterId: "Baizhu",
      id: "baizhu.constellation.6.radical_vitality.gossamer_sprite.seamless_shield.spiritvein",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "真邪合离 / C6 游丝徵灵产生无郤气护盾后灵气脉单次伤害（无反应）",
      sourceActionId: "baizhu.constellation.6.radical_vitality.gossamer_sprite.seamless_shield.spiritvein",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit and one initial Universal Diagnosis Gossamer Sprite hit remain verified baseline attack-scaling Dendro actions for lower-level calculation, but neither is a selected display metric because Baizhu's role-correct outputs here are his healing and shield. The selected support metric calculates one returning Gossamer Sprite heal as max HP × skill[1] plus skill[2], then source Healing Bonus and recipient Incoming Healing Bonus, for a nearby party member when the Sprite returns; C5 adds three Skill levels. The selected shield metric calculates one Seamless Shield applied to the current active party member as non-Dendro base absorption max HP × burst[0] plus burst[1], before that recipient's Shield Strength; C3 adds three Burst levels. This same single-shield magnitude also covers the Seamless Shield created by a C6 Gossamer Sprite hit. The dedicated C6 damage metric is zero through C5 and, at C6, evaluates one Spiritvein triggered after a Gossamer Sprite creates a new Seamless Shield while the prior shield can release: Attack × burst[6] plus 8% of Baizhu's max HP in the same base-damage stage. At C4, a separately selected current-action snapshot means Holistic Revivification was already cast and the evaluated recipient is nearby: all nearby party members gain 80 Elemental Mastery for 15 seconds. It does not infer the cast, distance, duration, shield sequence, or a rotation. It otherwise excludes additional Sprite attacks, repeated Shield refreshes, the 250% Dendro-damage absorption branch, burst healing, reaction bonus, external infusions, remaining passives and constellations, external effects, and other character states.",
  label: baizhuDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
