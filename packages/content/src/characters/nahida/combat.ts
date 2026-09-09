import type { CharacterCombatCoverage, CombatActionMetadata } from "../../combat/types.js"

import { nahidaDefinition } from "./definition.js"

function createKarmicOblivionAction(withSpread: boolean): CombatActionMetadata {
  return {
    ...(withSpread ? { additiveReaction: { bonus: 0, kind: "spread" as const } } : {}),
    characterId: "Nahida",
    damageKind: "direct",
    damageParts: [
      {
        coefficientParameterId: "tri-karma-purification-attack-ratio",
        id: "tri-karma-purification-karmic-oblivion",
        snapshotChecks: [
          { expectedCoefficient: 1.032, talentLevel: 1 },
          { expectedCoefficient: 1.8576, talentLevel: 10 }
        ]
      }
    ],
    element: nahidaDefinition.element,
    evaluator: "declared_direct",
    id:
      withSpread
        ? "nahida.constellation.6.fruit_of_reason.karmic_oblivion.single_hit.spread"
        : "nahida.constellation.6.fruit_of_reason.karmic_oblivion.single_hit",
    intrinsicEffects: [
      {
        coefficientParameterId: "a4-tri-karma-damage-bonus-per-elemental-mastery",
        kind: "source_stat",
        label: "固有天赋 · 慧明缘觉智论",
        minimumSourceAscension: 4,
        snapshotChecks: [{ expectedCoefficient: 0.001, talentLevel: 1 }],
        sourceStat: "elementalMastery",
        sourceStatMaximumParameterId: "a4-elemental-mastery-maximum-counted",
        sourceStatMaximumSnapshotChecks: [{ expectedCoefficient: 800, talentLevel: 1 }],
        sourceStatOffsetParameterId: "a4-elemental-mastery-threshold",
        sourceStatOffsetSnapshotChecks: [{ expectedCoefficient: 200, talentLevel: 1 }],
        target: "damageBonus"
      },
      {
        coefficientParameterId: "a4-tri-karma-critical-rate-per-elemental-mastery",
        kind: "source_stat",
        label: "固有天赋 · 慧明缘觉智论",
        minimumSourceAscension: 4,
        snapshotChecks: [{ expectedCoefficient: 0.0003, talentLevel: 1 }],
        sourceStat: "elementalMastery",
        sourceStatMaximumParameterId: "a4-elemental-mastery-maximum-counted",
        sourceStatMaximumSnapshotChecks: [{ expectedCoefficient: 800, talentLevel: 1 }],
        sourceStatOffsetParameterId: "a4-elemental-mastery-threshold",
        sourceStatOffsetSnapshotChecks: [{ expectedCoefficient: 200, talentLevel: 1 }],
        target: "critRate"
      }
    ],
    kind: "damage",
    parameterReferences: [
      {
        groupId: "skill",
        id: "tri-karma-purification-attack-ratio",
        parameterIndex: 2,
        source: "talent",
        talentSlot: "skill"
      },
      {
        groupId: "passive2",
        id: "a4-elemental-mastery-threshold",
        parameterIndex: 0,
        source: "talent",
        talentSlot: "passive"
      },
      {
        groupId: "passive2",
        id: "a4-elemental-mastery-maximum-counted",
        parameterIndex: 1,
        source: "talent",
        talentSlot: "passive"
      },
      {
        groupId: "passive2",
        id: "a4-tri-karma-damage-bonus-per-elemental-mastery",
        parameterIndex: 2,
        source: "talent",
        talentSlot: "passive"
      },
      {
        groupId: "passive2",
        id: "a4-tri-karma-critical-rate-per-elemental-mastery",
        parameterIndex: 3,
        source: "talent",
        talentSlot: "passive"
      }
    ],
    scalingStat: "attack",
    scenarioParameters: [
      {
        allowedValues: [0, 1],
        defaultValue: 0,
        id: "c6-karmic-oblivion-ready",
        label: "C6 大辨圆成之实：心景幻成后已命中蕴种印目标",
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
            parameterId: "c6-karmic-oblivion-ready",
            values: [
              { multiplier: 0, parameterValue: 0 },
              { multiplier: 0, parameterValue: 1 }
            ]
          },
          damagePartId: "tri-karma-purification-karmic-oblivion",
          hitCount: { kind: "scenario_parameter", parameterId: "c6-karmic-oblivion-ready" },
          id: "tri-karma-purification-karmic-oblivion",
          snapshot: "hit"
        }
      ],
      duration: 1
    }
  }
}

export const nahidaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Nahida",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.403048, talentLevel: 1 },
            { expectedCoefficient: 0.725486, talentLevel: 10 }
          ]
        }
      ],
      element: nahidaDefinition.element,
      evaluator: "declared_direct",
      id: "nahida.normal.auto.first_hit",
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
      characterId: "Nahida",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "all-schemes-to-know-press-damage",
          id: "all-schemes-to-know-press",
          snapshotChecks: [
            { expectedCoefficient: 0.984, talentLevel: 1 },
            { expectedCoefficient: 1.7712, talentLevel: 10 }
          ]
        }
      ],
      element: nahidaDefinition.element,
      evaluator: "declared_direct",
      id: "nahida.skill.all_schemes_to_know.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "all-schemes-to-know-press-damage",
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
      characterId: "Nahida",
      damageKind: "direct",
      damageParts: [
        {
          id: "tri-karma-purification",
          scalingTerms: [
            {
              coefficientParameterId: "tri-karma-purification-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 1.032, talentLevel: 1 },
                { expectedCoefficient: 1.8576, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "tri-karma-purification-elemental-mastery-ratio",
              snapshotChecks: [
                { expectedCoefficient: 2.064, talentLevel: 1 },
                { expectedCoefficient: 3.7152, talentLevel: 10 }
              ],
              stat: "elementalMastery"
            }
          ]
        }
      ],
      element: nahidaDefinition.element,
      evaluator: "declared_direct",
      id: "nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-tri-karma-damage-bonus-per-elemental-mastery",
          kind: "source_stat",
          label: "固有天赋 · 慧明缘觉智论",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.001, talentLevel: 1 }],
          sourceStat: "elementalMastery",
          sourceStatMaximumParameterId: "a4-elemental-mastery-maximum-counted",
          sourceStatMaximumSnapshotChecks: [{ expectedCoefficient: 800, talentLevel: 1 }],
          sourceStatOffsetParameterId: "a4-elemental-mastery-threshold",
          sourceStatOffsetSnapshotChecks: [{ expectedCoefficient: 200, talentLevel: 1 }],
          target: "damageBonus"
        },
        {
          coefficientParameterId: "a4-tri-karma-critical-rate-per-elemental-mastery",
          kind: "source_stat",
          label: "固有天赋 · 慧明缘觉智论",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.0003, talentLevel: 1 }],
          sourceStat: "elementalMastery",
          sourceStatMaximumParameterId: "a4-elemental-mastery-maximum-counted",
          sourceStatMaximumSnapshotChecks: [{ expectedCoefficient: 800, talentLevel: 1 }],
          sourceStatOffsetParameterId: "a4-elemental-mastery-threshold",
          sourceStatOffsetSnapshotChecks: [{ expectedCoefficient: 200, talentLevel: 1 }],
          target: "critRate"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "tri-karma-purification-attack-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "tri-karma-purification-elemental-mastery-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "passive2",
          id: "a4-elemental-mastery-threshold",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "a4-elemental-mastery-maximum-counted",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "a4-tri-karma-damage-bonus-per-elemental-mastery",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "a4-tri-karma-critical-rate-per-elemental-mastery",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "tri-karma-purification",
            elementalApplication: { icd: { kind: "none" } },
            id: "tri-karma-purification",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      additiveReaction: { bonus: 0, kind: "spread" },
      characterId: "Nahida",
      damageKind: "direct",
      damageParts: [
        {
          id: "tri-karma-purification",
          scalingTerms: [
            {
              coefficientParameterId: "tri-karma-purification-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 1.032, talentLevel: 1 },
                { expectedCoefficient: 1.8576, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "tri-karma-purification-elemental-mastery-ratio",
              snapshotChecks: [
                { expectedCoefficient: 2.064, talentLevel: 1 },
                { expectedCoefficient: 3.7152, talentLevel: 10 }
              ],
              stat: "elementalMastery"
            }
          ]
        }
      ],
      element: nahidaDefinition.element,
      evaluator: "declared_direct",
      id: "nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit.spread",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-tri-karma-damage-bonus-per-elemental-mastery",
          kind: "source_stat",
          label: "固有天赋 · 慧明缘觉智论",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.001, talentLevel: 1 }],
          sourceStat: "elementalMastery",
          sourceStatMaximumParameterId: "a4-elemental-mastery-maximum-counted",
          sourceStatMaximumSnapshotChecks: [{ expectedCoefficient: 800, talentLevel: 1 }],
          sourceStatOffsetParameterId: "a4-elemental-mastery-threshold",
          sourceStatOffsetSnapshotChecks: [{ expectedCoefficient: 200, talentLevel: 1 }],
          target: "damageBonus"
        },
        {
          coefficientParameterId: "a4-tri-karma-critical-rate-per-elemental-mastery",
          kind: "source_stat",
          label: "固有天赋 · 慧明缘觉智论",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.0003, talentLevel: 1 }],
          sourceStat: "elementalMastery",
          sourceStatMaximumParameterId: "a4-elemental-mastery-maximum-counted",
          sourceStatMaximumSnapshotChecks: [{ expectedCoefficient: 800, talentLevel: 1 }],
          sourceStatOffsetParameterId: "a4-elemental-mastery-threshold",
          sourceStatOffsetSnapshotChecks: [{ expectedCoefficient: 200, talentLevel: 1 }],
          target: "critRate"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "tri-karma-purification-attack-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "tri-karma-purification-elemental-mastery-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "passive2",
          id: "a4-elemental-mastery-threshold",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "a4-elemental-mastery-maximum-counted",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "a4-tri-karma-damage-bonus-per-elemental-mastery",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "a4-tri-karma-critical-rate-per-elemental-mastery",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    createKarmicOblivionAction(false),
    createKarmicOblivionAction(true)
  ],
  actionEffects: [
    ...([100, 120, 140, 160] as const).map((elementalMastery, index) => ({
      activation: "automatic" as const,
      condition: {
        kind: "enemy_count" as const,
        ...(index < 3 ? { maximum: index + 1 } : {}),
        minimum: index + 1
      },
      exclusivity: {
        group: "nahida-c4-marked-enemy-count",
        variant: index < 3 ? `${index + 1}-enemies` : "4-or-more-enemies"
      },
      id: `nahida.constellation.4.the_stem_of_manifest_inference.${index + 1}_marked_enemies.elemental_mastery`,
      label: `比量现行之茎 · C4 附近${index < 3 ? `${index + 1}名` : "至少4名"}敌人处于蕴种印状态（元素精通提高${elementalMastery}点）`,
      source: { characterId: "Nahida", kind: "character" as const, minimumSourceConstellation: 4 },
      target: "elementalMastery" as const,
      targetFilter: {
        actionIds: [
          "nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit",
          "nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit.spread",
          "nahida.constellation.6.fruit_of_reason.karmic_oblivion.single_hit",
          "nahida.constellation.6.fruit_of_reason.karmic_oblivion.single_hit.spread"
        ],
        recipientSourceRelation: "source" as const
      },
      value: { kind: "fixed" as const, value: elementalMastery }
    })),
    {
      activation: "active",
      id: "nahida.constellation.2.seed_of_stored_knowledge.quicken_related_target.defense_reduction",
      label: "正等善见之根 · C2 纳西妲自身蕴种印目标的减防已生效（原激化/超激化/蔓激化后30%，8秒）",
      source: { characterId: "Nahida", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyDefenseReduction",
      value: { kind: "fixed", value: 0.3 }
    },
    {
      activation: "maximum_reachable",
      id: "nahida.constellation.6.fruit_of_reason.karmic_oblivion.attack_base_damage",
      label: "大辨圆成之实 · C6 灭净三业·业障除基础伤害（200%攻击力）",
      source: { characterId: "Nahida", kind: "character", minimumSourceConstellation: 6 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: [
          "nahida.constellation.6.fruit_of_reason.karmic_oblivion.single_hit",
          "nahida.constellation.6.fruit_of_reason.karmic_oblivion.single_hit.spread"
        ],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 2 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "attack"
      }
    },
    {
      activation: "maximum_reachable",
      id: "nahida.constellation.6.fruit_of_reason.karmic_oblivion.elemental_mastery_base_damage",
      label: "大辨圆成之实 · C6 灭净三业·业障除基础伤害（400%元素精通）",
      source: { characterId: "Nahida", kind: "character", minimumSourceConstellation: 6 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: [
          "nahida.constellation.6.fruit_of_reason.karmic_oblivion.single_hit",
          "nahida.constellation.6.fruit_of_reason.karmic_oblivion.single_hit.spread"
        ],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 4 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "elementalMastery"
      }
    }
  ],
  characterId: "Nahida",
  metrics: [
    {
      actionId: "nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit",
      characterId: "Nahida",
      id: "nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit",
      kind: "damage",
      label: "所闻遍计 / 灭净三业单次触发 · 无反应",
      sourceActionId: "nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit.spread",
      characterId: "Nahida",
      id: "nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit.spread",
      kind: "damage",
      label: "所闻遍计 / 灭净三业单次触发 · 蔓激化",
      sourceActionId: "nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit.spread",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "nahida.constellation.6.fruit_of_reason.karmic_oblivion.single_hit",
      characterId: "Nahida",
      id: "nahida.constellation.6.fruit_of_reason.karmic_oblivion.single_hit",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "大辨圆成之实 / 灭净三业·业障除单次触发 · 无反应",
      sourceActionId: "nahida.constellation.6.fruit_of_reason.karmic_oblivion.single_hit",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "nahida.constellation.6.fruit_of_reason.karmic_oblivion.single_hit.spread",
      characterId: "Nahida",
      id: "nahida.constellation.6.fruit_of_reason.karmic_oblivion.single_hit.spread",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "大辨圆成之实 / 灭净三业·业障除单次触发 · 蔓激化",
      sourceActionId: "nahida.constellation.6.fruit_of_reason.karmic_oblivion.single_hit.spread",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit and one initial All Schemes to Know press hit are verified as lower-level attack-scaling Dendro hits. The selected neutral Tri-Karma Purification metric is one dynamic Dendro hit on a target already marked by Seed of Skandha after that target triggers an Elemental Reaction or takes Dendro Core damage. Its base includes the skill's attack and elemental-mastery ratios, but it declares no fixed reaction. A separate selected metric fixes one such hit as Spread, without constructing the setup. At ascension 4+, Awakening Elucidated's capped Elemental-Mastery-above-200 damage-bonus and Critical-Rate conversion is included. C2's selected enemy-debuff snapshot means a target already marked by Nahida and already affected by Quicken, Aggravate, or Spread has 30% Defense reduction for its following eight seconds. C4 now reads the selected enemy count for Tri-Karma and Karmic Oblivion metrics, whose actions already require a marked target, and grants the exact 100/120/140/160 Elemental Mastery tier for one/two/three/four-or-more marked nearby enemies. At C6, two dedicated metrics expose one Karmic Oblivion instance as 200% Attack + 400% Elemental Mastery, with neutral and Spread variants; both inherit C4 and the same A4 conversion and are absent through C5. Mark availability beyond the selected enemy-count snapshot, the 0.2-second trigger interval, six-trigger limit, duration, target selection, Burst element-count effects, A1's party-highest-Elemental-Mastery bonus, external infusions, and character states remain outside these single-event metrics.",
  label: nahidaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
