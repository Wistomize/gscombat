import type { CharacterCombatCoverage } from "../../combat/types.js"

import { alhaithamDefinition } from "./definition.js"

export const alhaithamCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Alhaitham",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.495257, talentLevel: 1 },
            { expectedCoefficient: 0.978996, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "alhaitham.normal.auto.first_hit",
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
      talentSlot: "normal",
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "normal-attack-first-hit",
            elementalApplication: {
              activation: "while_element_overridden",
              icd: { groupId: "alhaitham.normal", kind: "standard" }
            },
            elementOverrideTarget: "normal_attack",
            id: "normal-attack-first-hit",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      additiveReaction: { bonus: 0, kind: "spread" },
      characterId: "Alhaitham",
      damageKind: "direct",
      damageParts: [
        {
          id: "chisel-light-mirror-projection-attack",
          scalingTerms: [
            {
              coefficientParameterId:
                "chisel-light-mirror-projection-attack-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 0.672, talentLevel: 1 },
                { expectedCoefficient: 1.2096, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId:
                "chisel-light-mirror-projection-attack-elemental-mastery-ratio",
              snapshotChecks: [
                { expectedCoefficient: 1.344, talentLevel: 1 },
                { expectedCoefficient: 2.4192, talentLevel: 10 }
              ],
              stat: "elementalMastery"
            }
          ]
        }
      ],
      element: "dendro",
      evaluator: "declared_direct",
      id: "alhaitham.skill.particular_field_fetters_of_phenomena.chisel_light_mirror_projection_attack.spread",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-damage-bonus-per-elemental-mastery",
          kind: "source_stat",
          maximumValueParameterId: "a4-maximum-damage-bonus",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.001, talentLevel: 1 }],
          sourceStat: "elementalMastery",
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "chisel-light-mirror-projection-attack-attack-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "chisel-light-mirror-projection-attack-elemental-mastery-ratio",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "passive2",
          id: "a4-damage-bonus-per-elemental-mastery",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "a4-maximum-damage-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    }
  ],
  characterId: "Alhaitham",
  detail:
    "One first normal-attack hit is verified as a baseline C0 attack-scaling Physical hit. It can receive a maintained external melee normal-attack infusion, such as Chongyun's field; Alhaitham's self infusion, passives, constellations, and other states remain unmodeled. A second verified action models a C0 three-mirror Chisel-Light Mirror Projection Attack (one projection) under Quicken Spread as declared direct Dendro skill damage scaling on attack and elemental mastery. At ascension 4+, its capped Elemental-Mastery-derived projection damage bonus is included; the full 1/2/3-mirror totals, dendro infusion, A1, constellations, timing, ICD, and other states remain unmodeled.",
  label: alhaithamDefinition.name,
  metrics: [
    {
      actionId:
        "alhaitham.skill.particular_field_fetters_of_phenomena.chisel_light_mirror_projection_attack.spread",
      id: "alhaitham.skill.particular_field_fetters_of_phenomena.chisel_light_mirror_projection_attack.spread",
      sourceActionId:
        "alhaitham.skill.particular_field_fetters_of_phenomena.chisel_light_mirror_projection_attack.spread",
      characterId: "Alhaitham",
      kind: "damage",
      label: "殊境·显象缚结 / 琢光镜投影攻击 · 蔓激化",
      status: "verified",
      target: "enemy"
    }
  ],
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
