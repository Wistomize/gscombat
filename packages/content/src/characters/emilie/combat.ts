import type { CharacterCombatCoverage } from "../../combat/types.js"

import { emilieDefinition } from "./definition.js"

export const emilieCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Emilie",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.485608, talentLevel: 1 },
            { expectedCoefficient: 0.959922, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "emilie.normal.auto.first_hit",
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
      characterId: "Emilie",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "extraction-of-lacelight-skill-damage",
          id: "extraction-of-lacelight-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.4708, talentLevel: 1 },
            { expectedCoefficient: 0.84744, talentLevel: 10 }
          ]
        }
      ],
      element: emilieDefinition.element,
      evaluator: "declared_direct",
      id: "emilie.skill.extraction_of_lacelight.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "extraction-of-lacelight-skill-damage",
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
      characterId: "Emilie",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "lumidouce-case-level-two-attack-damage",
          id: "lumidouce-case-level-two-attack",
          snapshotChecks: [
            { expectedCoefficient: 0.84, talentLevel: 1 },
            { expectedCoefficient: 1.512, talentLevel: 10 }
          ]
        }
      ],
      element: emilieDefinition.element,
      evaluator: "declared_direct",
      id: "emilie.skill.extraction_of_lacelight.lumidouce_case.level_two.attack",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-burning-damage-bonus-per-1000-attack",
          kind: "source_stat",
          label: "固有天赋 · 精馏",
          maximumValueParameterId: "a4-maximum-burning-damage-bonus",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.15, talentLevel: 1 }],
          sourceStat: "attack",
          target: "damageBonus",
          valueMultiplier: 0.001
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "lumidouce-case-level-two-attack-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "passive2",
          id: "a4-burning-damage-bonus-per-1000-attack",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "a4-maximum-burning-damage-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "lumidouce-case-level-two-attack",
            hitCount: 2,
            id: "lumidouce-case-level-two-attack-pair",
            snapshot: "cast"
          }
        ],
        duration: 1
      }
    },
    {
      characterId: "Emilie",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "lumidouce-case-stage-three-attack-damage",
          id: "lumidouce-case-stage-three-attack",
          snapshotChecks: [
            { expectedCoefficient: 2.172, talentLevel: 1 },
            { expectedCoefficient: 3.9096, talentLevel: 10 }
          ]
        }
      ],
      element: emilieDefinition.element,
      evaluator: "declared_direct",
      id: "emilie.burst.aromatic_explication.lumidouce_case.stage_three_attack.single_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "lumidouce-case-stage-three-attack-damage",
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
      attackKind: "normal",
      characterId: "Emilie",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "c6-lingering-fragrance-normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.485608, talentLevel: 1 },
            { expectedCoefficient: 0.959922, talentLevel: 10 }
          ]
        }
      ],
      element: emilieDefinition.element,
      evaluator: "declared_direct",
      id: "emilie.constellation.6.marcotte_sillage.lingering_fragrance.normal_attack.first_hit",
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
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-lingering-fragrance-normal-attack-current",
          label: "C6 茉洁香迹：香迹留驻期间普通攻击",
          maximumValue: 0,
          minimumValue: 0,
          rangeBySourceConstellation: [
            { defaultValue: 1, maximumValue: 1, minimumSourceConstellation: 6, minimumValue: 1 }
          ]
        }
      ],
      status: "verified",
      talentSlot: "normal",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "c6-lingering-fragrance-normal-attack-current",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-lingering-fragrance-normal-attack-first-hit",
            id: "c6-lingering-fragrance-normal-attack-first-hit",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      attackKind: "charged",
      characterId: "Emilie",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "charged-attack-damage",
          id: "c6-lingering-fragrance-charged-attack",
          snapshotChecks: [
            { expectedCoefficient: 0.91332, talentLevel: 1 },
            { expectedCoefficient: 1.8054, talentLevel: 10 }
          ]
        }
      ],
      element: emilieDefinition.element,
      evaluator: "declared_direct",
      id: "emilie.constellation.6.marcotte_sillage.lingering_fragrance.charged_attack",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "charged-attack-damage",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-lingering-fragrance-charged-attack-current",
          label: "C6 茉洁香迹：香迹留驻期间重击",
          maximumValue: 0,
          minimumValue: 0,
          rangeBySourceConstellation: [
            { defaultValue: 1, maximumValue: 1, minimumSourceConstellation: 6, minimumValue: 1 }
          ]
        }
      ],
      status: "verified",
      talentSlot: "normal",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "c6-lingering-fragrance-charged-attack-current",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-lingering-fragrance-charged-attack",
            id: "c6-lingering-fragrance-charged-attack",
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
      id: "emilie.fragrance.c2.dendro_resistance_shred",
      label: "香韵命中后 · C2 草元素抗性降低（10秒）",
      source: { characterId: "Emilie", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["dendro"] },
      value: { kind: "fixed", value: 0.3 }
    },
    {
      activation: "automatic",
      id: "emilie.constellation.6.marcotte_sillage.normal_charged.attack_additive_damage",
      label: "茉洁香迹 · C6 香迹留驻期间普通攻击与重击伤害追加300%攻击力",
      source: { characterId: "Emilie", kind: "character", minimumSourceConstellation: 6 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: [
          "emilie.constellation.6.marcotte_sillage.lingering_fragrance.normal_attack.first_hit",
          "emilie.constellation.6.marcotte_sillage.lingering_fragrance.charged_attack"
        ],
        attackKinds: ["normal", "charged"],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 3 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "attack"
      }
    }
  ],
  characterId: "Emilie",
  metrics: [
    {
      actionId: "emilie.skill.extraction_of_lacelight.lumidouce_case.level_two.attack",
      characterId: "Emilie",
      id: "emilie.skill.extraction_of_lacelight.lumidouce_case.level_two.attack",
      kind: "damage",
      label: "撷萃调香 / 燃烧条件下柔灯之匣·二阶攻击（两次命中，无反应）",
      sourceActionId: "emilie.skill.extraction_of_lacelight.lumidouce_case.level_two.attack",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "emilie.constellation.6.marcotte_sillage.lingering_fragrance.normal_attack.first_hit",
      characterId: "Emilie",
      id: "emilie.constellation.6.marcotte_sillage.lingering_fragrance.normal_attack.first_hit",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "茉洁香迹 / C6 香迹留驻普通攻击首段（草元素、300%攻击力加算、无反应）",
      sourceActionId: "emilie.constellation.6.marcotte_sillage.lingering_fragrance.normal_attack.first_hit",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "emilie.constellation.6.marcotte_sillage.lingering_fragrance.charged_attack",
      characterId: "Emilie",
      id: "emilie.constellation.6.marcotte_sillage.lingering_fragrance.charged_attack",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "茉洁香迹 / C6 香迹留驻重击（草元素、300%攻击力加算、无反应）",
      sourceActionId: "emilie.constellation.6.marcotte_sillage.lingering_fragrance.charged_attack",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit, Extraction of Lacelight's initial AoE hit, and one Aromatic Explication Level 3 Lumidouce Case attack remain separately verified raw actions from the pinned 6.7 game-data snapshot at Genshin Optimizer commit 21c98eb60355160274a8c4cecfc5671e2151a073. The selected core metric is one Level 2 Lumidouce Case attack after its Burning condition has already been met: one target receives two same-coefficient Dendro hits, each Attack × skill[2]. The pinned values are 84.0% Attack per hit at Skill Level 1 and 151.2% per hit at Level 10, so the declared action totals 168.0% and 302.4% Attack respectively with a shared cast snapshot. Because Burning is the declared Level-2 precondition, A4's min(ATK / 1000 × 15%, 36%) all-damage bonus is included. C2 Dendro resistance reduction after a Fragrance hit is an explicit current-action snapshot. The two dedicated C6 actions are zero through C5 and, at C6, evaluate one Dendro-infused first Normal Attack or one Charged Attack during Lingering Fragrance, each with the constellation's 300% Attack additive base-damage term. The Fragrance created after these attacks and the resulting multi-action A1 cadence are not folded into either single-hit metric. Burning here is only the manually assumed condition that enables the Level 2 case; no Burning reaction damage, aura setup, or reaction is preset. It excludes Lumidouce Case attack count and duration, level transitions, Spiritbreath Thorn, other external infusions, timing, and other character states.",
  label: emilieDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
