import type { CharacterCombatCoverage } from "../../combat/types.js"

import { neferDefinition } from "./definition.js"

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
        }
      ],
      element: neferDefinition.element,
      evaluator: "declared_direct",
      id: "nefer.skill.senet_strategy.phantom_performance.second_hit",
      intrinsicEffects: [
        {
          coefficientParameterId: "a1-veil-elemental-mastery-bonus",
          kind: "flat",
          minimumSourceAscension: 1,
          scenarioParameterMultiplier: {
            parameterId: "a1-veil-stack-count",
            values: [
              { multiplier: 0, parameterValue: 0 },
              { multiplier: 0, parameterValue: 1 },
              { multiplier: 0, parameterValue: 2 },
              { multiplier: 1, parameterValue: 3 }
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
          groupId: "passive1",
          id: "a1-veil-elemental-mastery-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scenarioParameters: [
        {
          allowedValues: [0, 1, 2, 3],
          defaultValue: 3,
          id: "a1-veil-stack-count",
          label: "A1 幻戏帷幕层数（已满足月兆·满辉）",
          maximumValue: 3,
          minimumValue: 0
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
              parameterId: "a1-veil-stack-count",
              values: [
                { multiplier: 1, parameterValue: 0 },
                { multiplier: 1.08, parameterValue: 1 },
                { multiplier: 1.16, parameterValue: 2 },
                { multiplier: 1.24, parameterValue: 3 }
              ]
            },
            damagePartId: "phantom-performance-second-hit",
            id: "phantom-performance-second-hit",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    }
  ],
  characterId: "Nefer",
  metrics: [
    {
      actionId: "nefer.skill.senet_strategy.phantom_performance.second_hit",
      characterId: "Nefer",
      id: "nefer.skill.senet_strategy.phantom_performance.second_hit",
      kind: "damage",
      label: "弈术·千夜一舞 / 幻戏自身二段单次命中（C0，A1幻戏帷幕3层，无预设反应）",
      sourceActionId: "nefer.skill.senet_strategy.phantom_performance.second_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One baseline C0 first normal-attack hit, one Dance of a Thousand Nights initial hit, and one Phantom Performance self second hit are verified. The selected C0 metric reuses one direct Dendro Phantom Performance self second hit against one enemy: the pinned 6.7 Genshin Optimizer sheet maps it to skill[4] times Attack plus skill[5] times Elemental Mastery, or 0.2464 and 0.4928 at Talent Level 1, then 0.44352 and 0.88704 at Level 10. Its action-owned A1 Veil stack input is manually chosen from zero through three C0 stacks and defaults to three; after A1 is unlocked and Moon Sign: Ascendant is already satisfied, each stack multiplies this direct hit by 1.08, so the selected three-stack value is 1.24 times the two scaling terms. At the selected three stacks, A1's +100 Elemental Mastery is included before that multiplier. It does not preset a target aura or reaction. The skill's Lunar-Bloom shade hits are deliberately not declared as direct damage. The initial hit remains a verified underlying action but is no longer selected. External infusion, Shadow Dance sequences, Verdant Dew generation, charge availability, reactions, timing, other passives, constellations, external effects, and other states remain unmodeled.",
  label: neferDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
