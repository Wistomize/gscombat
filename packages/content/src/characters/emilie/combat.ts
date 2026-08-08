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
    }
  ],
  characterId: "Emilie",
  metrics: [
    {
      actionId: "emilie.skill.extraction_of_lacelight.lumidouce_case.level_two.attack",
      characterId: "Emilie",
      id: "emilie.skill.extraction_of_lacelight.lumidouce_case.level_two.attack",
      kind: "damage",
      label: "撷萃调香 / 燃烧条件下柔灯之匣·二阶攻击（两次命中，C0，无反应）",
      sourceActionId: "emilie.skill.extraction_of_lacelight.lumidouce_case.level_two.attack",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit, Extraction of Lacelight's initial AoE hit, and one Aromatic Explication Level 3 Lumidouce Case attack remain separately verified raw actions from the pinned 6.7 game-data snapshot at Genshin Optimizer commit 21c98eb60355160274a8c4cecfc5671e2151a073. The selected C0 core metric is one Level 2 Lumidouce Case attack after its Burning condition has already been met: one target receives two same-coefficient Dendro hits, each Attack × skill[2]. The pinned values are 84.0% Attack per hit at Skill Level 1 and 151.2% per hit at Level 10, so the declared action totals 168.0% and 302.4% Attack respectively with a shared cast snapshot. Because Burning is the declared Level-2 precondition, A4's min(ATK / 1000 × 15%, 36%) all-damage bonus is included. C2 Dendro resistance reduction after a Fragrance hit is an explicit current-action snapshot. Burning here is only the manually assumed condition that enables the Level 2 case; no Burning reaction damage, aura setup, or reaction is preset. It excludes Lumidouce Case attack count and duration, level transitions, Fragrance, Spiritbreath Thorn, A1, other constellations including inferred C3 Skill and C5 Burst levels, external infusions, timing, and other character states.",
  label: emilieDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
