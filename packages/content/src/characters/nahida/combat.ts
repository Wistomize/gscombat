import type { CharacterCombatCoverage } from "../../combat/types.js"

import { nahidaDefinition } from "./definition.js"

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
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "nahida.constellation.2.seed_of_stored_knowledge.quicken_related_target.defense_reduction",
      label: "正等善见之根 · C2 纳西妲自身蕴种印目标的减防已生效（原激化/超激化/蔓激化后30%，8秒）",
      source: { characterId: "Nahida", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyDefenseReduction",
      value: { kind: "fixed", value: 0.3 }
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
    }
  ],
  detail:
    "One first normal-attack hit and one initial All Schemes to Know press hit are verified as baseline C0 attack-scaling Dendro hits. The selected neutral Tri-Karma Purification metric is one dynamic Dendro hit on a target already marked by Seed of Skandha after that target triggers an Elemental Reaction or takes Dendro Core damage. Its base includes the skill's attack and elemental-mastery ratios, but it declares no fixed reaction: Spread is resolved only when the target scenario supplies a Quicken aura. A separate selected metric fixes one such hit as Spread, without constructing the setup. At ascension 4+, Awakening Elucidated's capped Elemental-Mastery-above-200 damage-bonus and Critical-Rate conversion is included. C2's selected enemy-debuff snapshot means a target already marked by Nahida and already affected by Quicken, Aggravate, or Spread has 30% Defense reduction for its following eight seconds; it does not model the triggering hit or C2's reaction-critical branches. Mark availability, the 2.5-second trigger interval, duration, linked-target count, target selection, Burst element-count effects, A1's party-highest-Elemental-Mastery bonus, other constellations, external infusions, and character states remain unmodeled.",
  label: nahidaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
