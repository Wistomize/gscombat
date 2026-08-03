import type { CharacterCombatCoverage } from "../../combat/types.js"

import { yaeMikoDefinition } from "./definition.js"

export const yaeMikoCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "YaeMiko",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.396584, talentLevel: 1 },
            { expectedCoefficient: 0.713851, talentLevel: 10 }
          ]
        }
      ],
      element: yaeMikoDefinition.element,
      evaluator: "declared_direct",
      id: "yae_miko.normal.auto.first_hit",
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
      characterId: "YaeMiko",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "yakan-evocation-sesshou-sakura-level-one-damage",
          id: "sesshou-sakura-level-one-bolt",
          snapshotChecks: [
            { expectedCoefficient: 0.60672, talentLevel: 1 },
            { expectedCoefficient: 1.092096, talentLevel: 10 }
          ]
        }
      ],
      element: yaeMikoDefinition.element,
      evaluator: "declared_direct",
      id: "yae_miko.skill.yakan_evocation.sesshou_sakura.level_one_bolt",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "yakan-evocation-sesshou-sakura-level-one-damage",
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
      characterId: "YaeMiko",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "yakan-evocation-sesshou-sakura-level-three-damage",
          id: "sesshou-sakura-level-three-bolt",
          snapshotChecks: [
            { expectedCoefficient: 0.948, talentLevel: 1 },
            { expectedCoefficient: 1.7064, talentLevel: 10 }
          ]
        }
      ],
      element: yaeMikoDefinition.element,
      evaluator: "declared_direct",
      id: "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-sesshou-sakura-damage-bonus-per-elemental-mastery",
          kind: "source_stat",
          label: "固有天赋 · 启蜇之祝词",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.0015, talentLevel: 1 }],
          sourceStat: "elementalMastery",
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "yakan-evocation-sesshou-sakura-level-three-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "passive2",
          id: "a4-sesshou-sakura-damage-bonus-per-elemental-mastery",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "YaeMiko",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "great-secret-art-tenko-kenshin-initial-lightning-damage",
          id: "great-secret-art-tenko-kenshin-initial-lightning",
          snapshotChecks: [
            { expectedCoefficient: 2.6, talentLevel: 1 },
            { expectedCoefficient: 4.68, talentLevel: 10 }
          ]
        }
      ],
      element: yaeMikoDefinition.element,
      evaluator: "declared_direct",
      id: "yae_miko.burst.great_secret_art_tenko_kenshin.initial_lightning",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "great-secret-art-tenko-kenshin-initial-lightning-damage",
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
      activation: "automatic",
      id: "yae_miko.constellation.6.sesshou_sakura.level_three.enemy_defense_ignore",
      label: "C6 · 杀生樱叁阶落雷无视 60% 防御力",
      source: { characterId: "YaeMiko", kind: "character", minimumSourceConstellation: 6 },
      target: "enemyDefenseIgnore",
      targetFilter: {
        actionIds: ["yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt"]
      },
      value: { kind: "fixed", value: 0.6 }
    }
  ],
  characterId: "YaeMiko",
  metrics: [
    {
      actionId: "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt",
      characterId: "YaeMiko",
      id: "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt",
      kind: "damage",
      label: "野干役咒·杀生樱 / 三座杀生樱·叁阶单次落雷（C0、无反应）",
      sourceActionId: "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit, one level-one Sesshou Sakura bolt, one level-three Sesshou Sakura bolt, and Great Secret Art: Tenko Kenshin's initial lightning are verified as attack-scaling Electro catalyst hits. The selected metric fixes exactly three deployed Sesshou Sakura, so one rank-three bolt uses skill[2]: 94.8% ATK at talent level 1 and 170.64% at level 10. At ascension 4+, A4's Elemental Mastery × 0.15% Sesshou Sakura damage bonus is included. C3/C5 raise the matching skill/burst table, and C6 makes only the declared rank-three Sesshou Sakura bolt ignore 60% enemy defense. This currently does not enforce C2's minimum Sesshou Sakura rank or infer placement, rank generation, recurrence, duration, targeting, or timing. The burst excludes Sesshou Sakura destruction, all Tenko thunderbolts, reactions, external infusions, dynamic buff-state behavior, and rotation behavior.",
  label: yaeMikoDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
