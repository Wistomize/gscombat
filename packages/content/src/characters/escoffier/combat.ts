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
    },
    {
      characterId: "Escoffier",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "low-temperature-cooking-frosty-parfait-damage",
          id: "cold-storage-frosty-parfait",
          snapshotChecks: [
            { expectedCoefficient: 1.2, talentLevel: 1 },
            { expectedCoefficient: 2.16, talentLevel: 10 },
            { expectedCoefficient: 2.55, talentLevel: 13 }
          ]
        }
      ],
      element: escoffierDefinition.element,
      evaluator: "declared_direct",
      id: "escoffier.skill.low_temperature_cooking.cold_storage.frosty_parfait.single_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "low-temperature-cooking-frosty-parfait-damage",
          // Pinned skillParams[1] is 冻霜芭菲伤害, separate from the cast hit at [0] and Ousia hit at [3].
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
      characterId: "Escoffier",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "low-temperature-cooking-skill-damage",
          id: "c6-special-grade-frosty-parfait-proxy",
          snapshotChecks: [{ expectedCoefficient: 0.504, talentLevel: 1 }]
        }
      ],
      element: escoffierDefinition.element,
      evaluator: "declared_direct",
      id: "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.single_hit",
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
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-special-grade-frosty-parfait-ready",
          label: "C6 缤纷茶会：特级冻冻芭菲已触发",
          maximumValue: 0,
          minimumValue: 0,
          rangeBySourceConstellation: [
            { defaultValue: 1, maximumValue: 1, minimumSourceConstellation: 6, minimumValue: 1 }
          ]
        }
      ],
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "c6-special-grade-frosty-parfait-ready",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 0, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-special-grade-frosty-parfait-proxy",
            id: "c6-special-grade-frosty-parfait-proxy",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      characterId: "Escoffier",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "low-temperature-cooking-skill-damage",
          id: "c6-special-grade-frosty-parfait-proxy",
          snapshotChecks: [{ expectedCoefficient: 0.504, talentLevel: 1 }]
        }
      ],
      element: escoffierDefinition.element,
      evaluator: "declared_direct",
      id: "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.maximum_six_hits",
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
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-special-grade-frosty-parfait-ready",
          label: "C6 缤纷茶会：同一料理机关冷藏模式的6次特级冻冻芭菲",
          maximumValue: 0,
          minimumValue: 0,
          rangeBySourceConstellation: [
            { defaultValue: 1, maximumValue: 1, minimumSourceConstellation: 6, minimumValue: 1 }
          ]
        }
      ],
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "c6-special-grade-frosty-parfait-ready",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 0, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-special-grade-frosty-parfait-proxy",
            id: "c6-special-grade-frosty-parfait-proxy",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      condition: { elements: ["cryo", "hydro"], kind: "team_element_count", minimum: 4 },
      id: "escoffier.constellation.1.pre_dinner_dance_for_your_tastebuds.freshly_prepared_delicacy.cryo_crit_damage",
      label: "味蕾绽放的餐前旋舞 · C1 四名水/冰角色时施放战技或爆发（冰元素伤害暴击伤害提高60%）",
      source: { characterId: "Escoffier", kind: "character", minimumSourceConstellation: 1 },
      target: "critDamage",
      targetFilter: { elements: ["cryo"] },
      value: { kind: "fixed", value: 0.6 }
    },
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
    },
    {
      activation: "maximum_reachable",
      id: "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.single_hit",
      label: "缤纷茶会 · C6 特级冻冻芭菲（500%爱可菲攻击力冰元素战技伤害）",
      source: { characterId: "Escoffier", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: [
          "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.single_hit"
        ],
        recipientSourceRelation: "source"
      },
      value: {
        canCrit: true,
        coefficient: { kind: "fixed", value: 5 },
        element: "cryo",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack",
        talentSlot: "skill"
      }
    },
    {
      activation: "maximum_reachable",
      id: "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.maximum_six_hits.first",
      label: "缤纷茶会 · C6 特级冻冻芭菲第1次（500%爱可菲攻击力冰元素战技伤害）",
      source: { characterId: "Escoffier", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: [
          "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.maximum_six_hits"
        ],
        recipientSourceRelation: "source"
      },
      value: {
        canCrit: true,
        coefficient: { kind: "fixed", value: 5 },
        element: "cryo",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack",
        talentSlot: "skill"
      }
    },
    {
      activation: "maximum_reachable",
      id: "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.maximum_six_hits.second",
      label: "缤纷茶会 · C6 特级冻冻芭菲第2次（500%爱可菲攻击力冰元素战技伤害）",
      source: { characterId: "Escoffier", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: [
          "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.maximum_six_hits"
        ],
        recipientSourceRelation: "source"
      },
      value: {
        canCrit: true,
        coefficient: { kind: "fixed", value: 5 },
        element: "cryo",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack",
        talentSlot: "skill"
      }
    },
    {
      activation: "maximum_reachable",
      id: "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.maximum_six_hits.third",
      label: "缤纷茶会 · C6 特级冻冻芭菲第3次（500%爱可菲攻击力冰元素战技伤害）",
      source: { characterId: "Escoffier", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: [
          "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.maximum_six_hits"
        ],
        recipientSourceRelation: "source"
      },
      value: {
        canCrit: true,
        coefficient: { kind: "fixed", value: 5 },
        element: "cryo",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack",
        talentSlot: "skill"
      }
    },
    {
      activation: "maximum_reachable",
      id: "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.maximum_six_hits.fourth",
      label: "缤纷茶会 · C6 特级冻冻芭菲第4次（500%爱可菲攻击力冰元素战技伤害）",
      source: { characterId: "Escoffier", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: [
          "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.maximum_six_hits"
        ],
        recipientSourceRelation: "source"
      },
      value: {
        canCrit: true,
        coefficient: { kind: "fixed", value: 5 },
        element: "cryo",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack",
        talentSlot: "skill"
      }
    },
    {
      activation: "maximum_reachable",
      id: "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.maximum_six_hits.fifth",
      label: "缤纷茶会 · C6 特级冻冻芭菲第5次（500%爱可菲攻击力冰元素战技伤害）",
      source: { characterId: "Escoffier", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: [
          "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.maximum_six_hits"
        ],
        recipientSourceRelation: "source"
      },
      value: {
        canCrit: true,
        coefficient: { kind: "fixed", value: 5 },
        element: "cryo",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack",
        talentSlot: "skill"
      }
    },
    {
      activation: "maximum_reachable",
      id: "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.maximum_six_hits.sixth",
      label: "缤纷茶会 · C6 特级冻冻芭菲第6次（500%爱可菲攻击力冰元素战技伤害）",
      source: { characterId: "Escoffier", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: [
          "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.maximum_six_hits"
        ],
        recipientSourceRelation: "source"
      },
      value: {
        canCrit: true,
        coefficient: { kind: "fixed", value: 5 },
        element: "cryo",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack",
        talentSlot: "skill"
      }
    }
  ],
  characterId: "Escoffier",
  metrics: [
    {
      actionId: "escoffier.skill.low_temperature_cooking.cold_storage.frosty_parfait.single_hit",
      characterId: "Escoffier",
      id: "escoffier.skill.low_temperature_cooking.cold_storage.frosty_parfait.single_hit",
      kind: "damage",
      label: "低温烹饪 / 低温冷藏·冻霜芭菲单次伤害",
      sourceActionId: "escoffier.skill.low_temperature_cooking.cold_storage.frosty_parfait.single_hit",
      status: "verified",
      target: "enemy"
    },
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
    },
    {
      actionId: "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.single_hit",
      characterId: "Escoffier",
      id: "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.single_hit",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "C6 缤纷茶会 / 特级冻冻芭菲单次",
      sourceActionId: "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.single_hit",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.maximum_six_hits",
      characterId: "Escoffier",
      id: "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.maximum_six_hits",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "C6 缤纷茶会 / 特级冻冻芭菲6次合计",
      sourceActionId: "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.maximum_six_hits",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "Scoring Cut's initial hit and one Low-Temperature Cooking tap initial hit remain verified attack-scaling Cryo actions. The regular Cold Storage Frosty Parfait metric is one periodic Cryo Skill hit using Attack × skill[1]: 120% at Talent Level 1, 216% at Level 10, or 255% at Level 13 after C3's Skill Talent Level +3. It excludes the cast hit, Ousia hit, duration totals, and C6 Special-Grade Frosty Parfait events. Escoffier's healing metric is one nearby party member's Scoring Cut cast healing: Attack × burst[1] + burst[2], then healing bonus, with burst Talent Level +3 at C5. The pinned snapshot maps the ratio to 1.72032 at Talent Level 1 and 3.096576 at Level 10, and the flat value to 1078.5255 and 2372.936. C6 provides owner-scoped Special-Grade Frosty Parfait metrics: each event is 500% of Escoffier's own Attack as Crit-eligible Cryo Skill damage, so it uses her own Cryo bonus, Crit, and Skill bonus; the maximum metric retains all six separate 0.5-second-cooldown events from one Cold Storage Cooking Mek. These metrics are zero below C6. In an all-Hydro/Cryo four-character party, C1's maximum-reachable post-Skill-or-Burst state also contributes 60% Cryo Crit DMG to every Parfait hit. Better than Medicine is automatically resolved as the current 12-second window after Low-Temperature Cooking or Scoring Cut hits: each configured Hydro or Cryo party member contributes its cumulative 5%/5%/5%/40% tier, reducing eligible Hydro and Cryo resistance by 5%/10%/15%/55%. It does not model the number of healed teammates, Cooking Mek's passive heal, hold behavior, timing, external effects, or other character states.",
  label: escoffierDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
