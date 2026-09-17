import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage } from "../../combat/types.js"

import { yaeMikoDefinition } from "./definition.js"

const stellarConductApplicationsParameter = {
  defaultValue: 12,
  id: "stored-elemental-applications",
  label: "当前极星辉域已储存元素附着次数",
  maximumValue: 12,
  minimumValue: 0
} as const

const c2SesshouSakuraRankFourParameter = {
  allowedValues: [0, 1],
  defaultValue: 0,
  id: "c2-sesshou-sakura-rank-four",
  label: "C2 望月吼哕声 / 三座杀生樱提升至肆阶",
  maximumValue: 0,
  minimumValue: 0,
  rangeBySourceConstellation: [
    { defaultValue: 1, maximumValue: 1, minimumSourceConstellation: 2, minimumValue: 1 }
  ]
} as const

export const yaeMikoCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("yae-miko", 5, {"initialUses":3}),
    { id: "yae-miko.kit.stellar-damage", label: "辉映状态下自身造成星烁反应伤害", kind: "special_reaction_damage", recipient: "self", sourceFieldPresence: "any", sustained: true, specialReactions: ["stellar_superconduct"], requiredTeamReaction: "stellar_superconduct" },
    ...declareWeaponHitCapabilities(yaeMikoDefinition),
    declareHitCapability("yae-miko.kit.skill_burst_hits", "战技/爆发直接命中准备", ["skill","burst"], ["electro"]),
    { ...declareHitCapability("yae-miko.kit.sustained_skill_hits", "可持续造成战技命中", ["skill"], ["electro"], true), skillHitOpportunities: { withinSeconds: 7, count: 2, minimumSeparationSeconds: 0.3 } },
  ],
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
      scenarioParameters: [c2SesshouSakuraRankFourParameter],
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: c2SesshouSakuraRankFourParameter.id,
              values: [
                { multiplier: 1, parameterValue: 0 },
                { multiplier: 1.25, parameterValue: 1 }
              ]
            },
            damagePartId: "sesshou-sakura-level-three-bolt-aggravate",
            id: "sesshou-sakura-current-rank-bolt-aggravate",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      characterId: "YaeMiko",
      damageKind: "special_reaction",
      damageParts: [
        {
          coefficientParameterId: "purification-proclamation-radiance-stellar-superconduct-damage",
          id: "purification-proclamation-radiance-stellar-superconduct-damage",
          snapshotChecks: [{ expectedCoefficient: 2, talentLevel: 1 }]
        }
      ],
      element: yaeMikoDefinition.element,
      evaluator: "declared_special_reaction",
      id: "yae_miko.locked_passive.purification_proclamation.radiance.stellar_superconduct",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "lockedPassive",
          id: "purification-proclamation-radiance-stellar-superconduct-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [stellarConductApplicationsParameter],
      specialReaction: {
        kind: "stellar_superconduct",
        stellarStoredElementalApplicationsParameterId: stellarConductApplicationsParameter.id
      },
      status: "verified",
      talentSlot: "passive"
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
      scenarioParameters: [c2SesshouSakuraRankFourParameter],
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: c2SesshouSakuraRankFourParameter.id,
              values: [
                { multiplier: 1, parameterValue: 0 },
                { multiplier: 1.25, parameterValue: 1 }
              ]
            },
            damagePartId: "sesshou-sakura-level-three-bolt",
            id: "sesshou-sakura-current-rank-bolt",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
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
      requiresRecipientOnField: true,
      label: "望月吼哕声 · C2 肆阶杀生樱（当前场上角色元素精通提高200点）",
      source: { characterId: "YaeMiko", kind: "character", minimumSourceConstellation: 2 },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "not_source" },
      value: { kind: "fixed", value: 200 }
    },
    {
      activation: "maximum_reachable",
      id: "yae_miko.constellation.4.sakura_channeling.after_sesshou_sakura_hit.electro_damage_bonus",
      label: "绯樱引雷章 · C4 杀生樱落雷命中后的5秒内（队伍雷元素伤害加成20%）",
      source: { characterId: "YaeMiko", kind: "character", minimumSourceConstellation: 4 },
      target: "damageBonus",
      targetFilter: { elements: ["electro"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "automatic",
      id: "yae_miko.constellation.6.sesshou_sakura.level_three.enemy_defense_ignore",
      label: "大杀生咒禁 · C6 杀生樱落雷无视60%防御力",
      source: { characterId: "YaeMiko", kind: "character", minimumSourceConstellation: 6 },
      target: "enemyDefenseIgnore",
      targetFilter: {
        actionIds: [
          "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt",
          "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt.aggravate"
        ]
      },
      value: { kind: "fixed", value: 0.6 }
    },
    {
      activation: "maximum_reachable",
      id: "yae_miko.constellation.6.self.stellar_superconduct.crit_damage",
      label: "大杀生咒禁 · C6 八重神子造成的星超导反应暴击伤害提高200%",
      source: { characterId: "YaeMiko", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: { recipientSourceRelation: "source", specialReactionKinds: ["stellar_superconduct"] },
      value: { kind: "fixed", value: 2 }
    }
  ],
  characterId: "YaeMiko",
  metrics: [
    {
      actionId: "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt",
      characterId: "YaeMiko",
      id: "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt",
      kind: "damage",
      label: "野干役咒·杀生樱 / 三座杀生樱单次落雷（C2起肆阶、无反应）",
      sourceActionId: "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt.aggravate",
      characterId: "YaeMiko",
      id: "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt.aggravate",
      kind: "damage",
      label: "野干役咒·杀生樱 / 三座杀生樱单次落雷（C2起肆阶、超激化）",
      sourceActionId: "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt.aggravate",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "yae_miko.locked_passive.purification_proclamation.radiance.stellar_superconduct",
      characterId: "YaeMiko",
      id: "yae_miko.locked_passive.purification_proclamation.radiance.stellar_superconduct",
      kind: "damage",
      label: "祓所之讬宣 / 辉映·星超导额外伤害（200%攻击力）",
      sourceActionId: "yae_miko.locked_passive.purification_proclamation.radiance.stellar_superconduct",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit, one level-one Sesshou Sakura bolt, one three-Sakura bolt, its Aggravate variant, Great Secret Art: Tenko Kenshin's initial lightning, and Purification Proclamation's 200% ATK Radiance follow-up are verified. The selected Sesshou Sakura metrics fix exactly three deployed Sakura: below C2 they use the rank-three skill[2] coefficient, while C2 and above automatically multiply that coefficient by 1.25, exactly matching the rank-four skill[3] table at every talent level. At ascension 4+, A4's Elemental Mastery × 0.15% Sesshou Sakura damage bonus is included. The selected Stellar-Superconduct metric contains only the locked passive's 200% ATK follow-up and excludes both its preceding 80% ATK ordinary Electro addition and A1's separate 50% ATK Stellar-Superconduct strike. Under Radiance: Stellar-Conduct, C1's reachable trigger grants the party 50% Electro and Stellar-Superconduct damage. C2 also grants 200 Elemental Mastery to Yae Miko and the current active character, while C4's maximum-reachable post-Sakura-hit state adds 20% Electro damage to the party. C3/C5 raise the matching skill/burst table. C6 makes either declared three-Sakura bolt ignore 60% enemy defense and grants Yae Miko's own Stellar-Superconduct damage 200% CRIT DMG. Placement, recurrence, duration, targeting, external infusions, other dynamic buff-state behavior, and rotation behavior remain outside these single-hit metrics.",
  label: yaeMikoDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
