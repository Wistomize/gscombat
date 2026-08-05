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
      additiveReaction: { bonus: 0, kind: "aggravate" },
      characterId: "YaeMiko",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "yakan-evocation-sesshou-sakura-level-three-damage",
          id: "sesshou-sakura-level-three-bolt-aggravate",
          snapshotChecks: [
            { expectedCoefficient: 0.948, talentLevel: 1 },
            { expectedCoefficient: 1.7064, talentLevel: 10 }
          ]
        }
      ],
      element: yaeMikoDefinition.element,
      evaluator: "declared_direct",
      id: "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt.aggravate",
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
      activation: "maximum_reachable",
      condition: { elements: ["cryo"], kind: "team_element_count", minimum: 1 },
      id: "yae_miko.constellation.1.electro_damage_bonus",
      label: "野狐供真篇 · C1 触发超导或星超导后（雷元素伤害提高50%）",
      source: { characterId: "YaeMiko", kind: "character", minimumSourceConstellation: 1 },
      target: "damageBonus",
      targetFilter: { elements: ["electro"] },
      value: { kind: "fixed", value: 0.5 }
    },
    {
      activation: "maximum_reachable",
      id: "yae_miko.constellation.1.stellar_superconduct_damage_bonus",
      label: "野狐供真篇 · C1 触发星超导后（星超导反应伤害提高50%）",
      source: { characterId: "YaeMiko", kind: "character", minimumSourceConstellation: 1 },
      target: "specialReactionDamageBonus",
      targetFilter: { specialReactionKinds: ["stellar_superconduct"] },
      value: { kind: "fixed", value: 0.5 }
    },
    {
      activation: "maximum_reachable",
      id: "yae_miko.constellation.2.self.elemental_mastery",
      label: "望月吼哕声 · C2 肆阶杀生樱（八重神子元素精通提高200点）",
      source: { characterId: "YaeMiko", kind: "character", minimumSourceConstellation: 2 },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 200 }
    },
    {
      activation: "maximum_reachable",
      id: "yae_miko.constellation.2.active_character.elemental_mastery",
      label: "望月吼哕声 · C2 肆阶杀生樱（当前场上角色元素精通提高200点）",
      source: { characterId: "YaeMiko", kind: "character", minimumSourceConstellation: 2 },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "not_source" },
      value: { kind: "fixed", value: 200 }
    },
    {
      activation: "automatic",
      id: "yae_miko.constellation.6.sesshou_sakura.level_three.enemy_defense_ignore",
      label: "C6 · 杀生樱叁阶落雷无视 60% 防御力",
      source: { characterId: "YaeMiko", kind: "character", minimumSourceConstellation: 6 },
      target: "enemyDefenseIgnore",
      targetFilter: {
        actionIds: [
          "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt",
          "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt.aggravate"
        ]
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
    },
    {
      actionId: "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt.aggravate",
      characterId: "YaeMiko",
      id: "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt.aggravate",
      kind: "damage",
      label: "野干役咒·杀生樱 / 三座杀生樱·叁阶单次落雷（超激化，队伍含草元素）",
      sourceActionId: "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt.aggravate",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit, one level-one Sesshou Sakura bolt, one level-three Sesshou Sakura bolt, its Dendro-team Aggravate variant, and Great Secret Art: Tenko Kenshin's initial lightning are verified as attack-scaling Electro catalyst hits. The selected Sesshou Sakura metrics fix exactly three deployed Sesshou Sakura, so one rank-three bolt uses skill[2]: 94.8% ATK at talent level 1 and 170.64% at level 10. At ascension 4+, A4's Elemental Mastery × 0.15% Sesshou Sakura damage bonus is included. Under Radiance: Stellar-Conduct, C1's reachable trigger grants the party 50% Electro and Stellar-Superconduct damage. A C2 build reaches rank four with three Sesshou Sakura and grants 200 Elemental Mastery to Yae Miko and the current active character. C3/C5 raise the matching skill/burst table, and C6 makes either declared rank-three Sesshou Sakura bolt ignore 60% enemy defense. Placement, recurrence, duration, targeting, the separate Stellar-Superconduct follow-up hits, external infusions, other dynamic buff-state behavior, and rotation behavior remain outside these single-hit metrics.",
  label: yaeMikoDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
