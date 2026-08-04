import type { CharacterCombatCoverage } from "../../combat/types.js"

import { neferDefinition } from "./definition.js"

const phantomPerformanceVeilMultiplier = {
  kind: "scenario_parameter_lookup" as const,
  parameterId: "a1-veil-stack-count",
  values: [
    { multiplier: 1, parameterValue: 0 },
    { multiplier: 1.08, parameterValue: 1 },
    { multiplier: 1.16, parameterValue: 2 },
    { multiplier: 1.24, parameterValue: 3 },
    { multiplier: 1.32, parameterValue: 4 },
    { multiplier: 1.4, parameterValue: 5 }
  ]
} as const

export const neferCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Nefer",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.380712, talentLevel: 1 },
            { expectedCoefficient: 0.685282, talentLevel: 10 }
          ]
        }
      ],
      element: neferDefinition.element,
      evaluator: "declared_direct",
      id: "nefer.normal.auto.first_hit",
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
      characterId: "Nefer",
      damageKind: "direct",
      damageParts: [
        {
          id: "dance-of-a-thousand-nights-initial-hit",
          scalingTerms: [
            {
              coefficientParameterId: "dance-of-a-thousand-nights-attack",
              snapshotChecks: [
                { expectedCoefficient: 0.76384, talentLevel: 1 },
                { expectedCoefficient: 1.374912, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "dance-of-a-thousand-nights-elemental-mastery",
              snapshotChecks: [
                { expectedCoefficient: 1.52768, talentLevel: 1 },
                { expectedCoefficient: 2.749824, talentLevel: 10 }
              ],
              stat: "elementalMastery"
            }
          ]
        }
      ],
      element: neferDefinition.element,
      evaluator: "declared_direct",
      id: "nefer.skill.senet_strategy.dance_of_a_thousand_nights.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "dance-of-a-thousand-nights-attack",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "dance-of-a-thousand-nights-elemental-mastery",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Nefer",
      damageKind: "direct",
      damageParts: [
        {
          id: "phantom-performance-second-hit",
          scalingTerms: [
            {
              coefficientParameterId: "phantom-performance-second-hit-attack",
              snapshotChecks: [
                { expectedCoefficient: 0.2464, talentLevel: 1 },
                { expectedCoefficient: 0.44352, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "phantom-performance-second-hit-elemental-mastery",
              snapshotChecks: [
                { expectedCoefficient: 0.4928, talentLevel: 1 },
                { expectedCoefficient: 0.88704, talentLevel: 10 }
              ],
              stat: "elementalMastery"
            }
          ]
        },
        {
          id: "phantom-performance-self-second-hit",
          scalingTerms: [
            {
              coefficientParameterId: "phantom-performance-self-second-hit-attack",
              snapshotChecks: [
                { expectedCoefficient: 0.32032, talentLevel: 1 },
                { expectedCoefficient: 0.576576, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "phantom-performance-self-second-hit-elemental-mastery",
              snapshotChecks: [
                { expectedCoefficient: 0.64064, talentLevel: 1 },
                { expectedCoefficient: 1.153152, talentLevel: 10 }
              ],
              stat: "elementalMastery"
            }
          ]
        },
        {
          coefficientParameterId: "phantom-performance-shade-first-hit-elemental-mastery",
          id: "phantom-performance-shade-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.96, talentLevel: 1 },
            { expectedCoefficient: 1.728, talentLevel: 10 }
          ]
        },
        {
          coefficientParameterId: "phantom-performance-shade-second-hit-elemental-mastery",
          id: "phantom-performance-shade-second-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.96, talentLevel: 1 },
            { expectedCoefficient: 1.728, talentLevel: 10 }
          ]
        },
        {
          coefficientParameterId: "phantom-performance-shade-third-hit-elemental-mastery",
          id: "phantom-performance-shade-third-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.28, talentLevel: 1 },
            { expectedCoefficient: 2.304, talentLevel: 10 }
          ]
        }
      ],
      element: neferDefinition.element,
      evaluator: "declared_direct",
      id: "nefer.skill.senet_strategy.phantom_performance.second_hit",
      intrinsicEffects: [
        {
          coefficientParameterId: "a1-veil-elemental-mastery-bonus",
          kind: "flat",
          label: "固有天赋 · 月下的豪赌",
          minimumSourceAscension: 1,
          scenarioParameterMultiplier: {
            parameterId: "a1-veil-stack-count",
            values: [
              { multiplier: 0, parameterValue: 0 },
              { multiplier: 0, parameterValue: 1 },
              { multiplier: 0, parameterValue: 2 },
              { multiplier: 1, parameterValue: 3 },
              { multiplier: 1, parameterValue: 4 },
              { multiplier: 2, parameterValue: 5 }
            ]
          },
          snapshotChecks: [{ expectedCoefficient: 100, talentLevel: 1 }],
          target: "elementalMastery"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "phantom-performance-second-hit-attack",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "phantom-performance-second-hit-elemental-mastery",
          parameterIndex: 5,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "phantom-performance-self-second-hit-attack",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "phantom-performance-self-second-hit-elemental-mastery",
          parameterIndex: 7,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "phantom-performance-shade-first-hit-elemental-mastery",
          parameterIndex: 8,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "phantom-performance-shade-second-hit-elemental-mastery",
          parameterIndex: 9,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "phantom-performance-shade-third-hit-elemental-mastery",
          parameterIndex: 10,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "passive1",
          id: "a1-veil-elemental-mastery-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scenarioParameters: [
        {
          allowedValues: [0, 1, 2, 3, 4, 5],
          defaultValue: 3,
          id: "a1-veil-stack-count",
          label: "A1 幻戏帷幕层数（已满足月兆·满辉；C2 自动补足至5层）",
          maximumValue: 5,
          minimumValue: 0
        }
      ],
      status: "verified",
      scalingStat: "elementalMastery",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: phantomPerformanceVeilMultiplier,
            damagePartId: "phantom-performance-second-hit",
            id: "phantom-performance-self-first-hit",
            snapshot: "hit"
          },
          {
            at: 0.08,
            coefficientMultiplier: phantomPerformanceVeilMultiplier,
            damagePartId: "phantom-performance-self-second-hit",
            id: "phantom-performance-self-second-hit",
            snapshot: "hit"
          },
          {
            at: 0.16,
            coefficientMultiplier: phantomPerformanceVeilMultiplier,
            damagePartId: "phantom-performance-shade-first-hit",
            id: "phantom-performance-shade-first-hit",
            snapshot: "hit",
            specialReaction: { kind: "lunar_bloom" }
          },
          {
            at: 0.24,
            coefficientMultiplier: phantomPerformanceVeilMultiplier,
            damagePartId: "phantom-performance-shade-second-hit",
            id: "phantom-performance-shade-second-hit",
            snapshot: "hit",
            specialReaction: { kind: "lunar_bloom" }
          },
          {
            at: 0.32,
            coefficientMultiplier: phantomPerformanceVeilMultiplier,
            damagePartId: "phantom-performance-shade-third-hit",
            id: "phantom-performance-shade-third-hit",
            snapshot: "hit",
            specialReaction: { kind: "lunar_bloom" }
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "nefer.passive.moonsign_benediction.dusklit_eaves.lunar_bloom_base_damage_bonus",
      label: "月兆祝赐·暮檐 · 月绽放基础伤害加成",
      source: { characterId: "Nefer", kind: "character" },
      target: "specialReactionBaseDamageBonus",
      targetFilter: { specialReactionKinds: ["lunar_bloom"] },
      value: {
        kind: "final_elemental_mastery",
        maximumValue: {
          kind: "talent_parameter",
          parameter: {
            groupId: "passive3",
            id: "lunar-bloom-base-damage-bonus-maximum",
            parameterIndex: 1,
            source: "talent",
            talentSlot: "passive"
          }
        },
        multiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "passive3",
            id: "lunar-bloom-base-damage-bonus-per-elemental-mastery",
            parameterIndex: 0,
            source: "talent",
            talentSlot: "passive"
          }
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "nefer.constellation.1.planning_breeds_success.phantom_performance.lunar_bloom_base_damage",
      label: "C1 谋定而后动 · 幻戏月绽放基础伤害增加",
      source: { characterId: "Nefer", kind: "character", minimumSourceConstellation: 1 },
      target: "specialReactionBaseDamageFlat",
      targetFilter: {
        actionIds: ["nefer.skill.senet_strategy.phantom_performance.second_hit"],
        recipientSourceRelation: "source",
        specialReactionKinds: ["lunar_bloom"]
      },
      value: {
        kind: "final_elemental_mastery",
        multiplier: { kind: "fixed", value: 0.6 }
      }
    },
    {
      activation: "maximum_reachable",
      actionParameterId: "a1-veil-stack-count",
      id: "nefer.constellation.2.observation_feeds_strategy.veil_stack_count",
      label: "C2 观局得谋 · 幻戏帷幕满层额外2层",
      source: { characterId: "Nefer", kind: "character", minimumSourceConstellation: 2 },
      target: "actionParameter",
      targetFilter: {
        actionIds: ["nefer.skill.senet_strategy.phantom_performance.second_hit"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 2 }
    },
    {
      activation: "maximum_reachable",
      id: "nefer.constellation.4.delusion_ensnares_reason.dendro_resistance_reduction",
      label: "C4 妄念迷心 · 暗影舞状态下草元素抗性降低",
      source: { characterId: "Nefer", kind: "character", minimumSourceConstellation: 4 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["dendro"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.2 }
    }
  ],
  characterId: "Nefer",
  metrics: [
    {
      actionId: "nefer.skill.senet_strategy.phantom_performance.second_hit",
      characterId: "Nefer",
      id: "nefer.skill.senet_strategy.phantom_performance.second_hit",
      kind: "damage",
      label: "弈术·千夜一舞 / 幻戏完整五段命中期望伤害",
      sourceActionId: "nefer.skill.senet_strategy.phantom_performance.second_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The selected Phantom Performance metric resolves its complete five-hit sequence against one enemy: two ordinary Dendro self-hits (skill[4] + skill[5], then skill[6] + skill[7]) followed by three direct Lunar-Bloom shade hits (skill[8], skill[9], and skill[10]). The first self-hit remains under its established identifier for saved-workspace compatibility. The A1 Veil input defaults to its full three-stack Ascendant-Gleam state, applying +100 Elemental Mastery and a 1.24 base multiplier to every hit; C2 automatically adds two stacks and raises the same state to +200 Elemental Mastery and 1.40. Nefer's Moonsign Benediction contributes min(final Elemental Mastery × 0.0175%, 14%) in the Lunar-Bloom base-damage-bonus stage. C1 adds 60% of Nefer's final Elemental Mastery to the three shade hits' Lunar-Bloom base damage, and C4's Dendro resistance reduction is included. C6's conversion/extra hit and final Lunar-Bloom elevation, Shadow Dance timing, Verdant Dew generation, target aura, and full rotations remain outside this single-action metric.",
  label: neferDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
