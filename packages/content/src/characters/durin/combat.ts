import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage } from "../../combat/types.js"

import { durinDefinition } from "./definition.js"

const durinWhiteFlameResistanceElements = ["anemo", "dendro", "electro", "geo", "pyro"] as const
const durinWhiteFlameResistanceElementLabels = {
  anemo: "风",
  dendro: "草",
  electro: "雷",
  geo: "岩",
  pyro: "火"
} as const

function createDurinWhiteFlameResistanceEffects(
  element: (typeof durinWhiteFlameResistanceElements)[number]
): NonNullable<CharacterCombatCoverage["actionEffects"]> {
  const baseEffectId = `durin.passive.light_spirit.white_flame_dragon.${element}_resistance_reduction`
  const elementLabel = durinWhiteFlameResistanceElementLabels[element]
  return [
    {
      activation: "active",
      exclusivity: { group: "durin-light-spirit-manifestation", variant: "white-flame-dragon" },
      id: baseEffectId,
      label: `光灵遵神数显现 · 白焰之龙触发后的${elementLabel}元素抗性降低`,
      source: { characterId: "Durin", kind: "character", minimumSourceAscension: 1 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: [element] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "active",
      condition: { kind: "hexerei_secret_rite" },
      id: `durin.locked_passive.sublimation_hymn.white_flame_dragon.${element}_extra_resistance_reduction`,
      label: `魔女的前夜礼·升华赞歌 · 白焰之龙${elementLabel}元素抗性额外降低`,
      requiredActiveEffectIds: [baseEffectId],
      source: { characterId: "Durin", kind: "character" },
      target: "enemyResistanceReduction",
      targetFilter: { elements: [element] },
      value: { kind: "fixed", value: 0.15 }
    }
  ]
}

export const durinCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("durin", 5),
    ...declareWeaponHitCapabilities(durinDefinition),
    declareHitCapability("durin.kit.skill_burst_hits", "已维护战技/爆发命中机制", ["skill"], ["pyro"]),
  ],
  actions: [
    {
      characterId: "Durin",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.456505, talentLevel: 1 },
            { expectedCoefficient: 0.902394, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "durin.normal.auto.first_hit",
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
      characterId: "Durin",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "purity-transformation-damage",
          id: "purity-transformation",
          snapshotChecks: [
            { expectedCoefficient: 1.056, talentLevel: 1 },
            { expectedCoefficient: 1.9008, talentLevel: 10 }
          ]
        }
      ],
      element: durinDefinition.element,
      evaluator: "declared_direct",
      id: "durin.skill.binary_formula.purity_transformation",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "purity-transformation-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    }
  ],
  characterId: "Durin",
  actionEffects: [
    ...durinWhiteFlameResistanceElements.flatMap(createDurinWhiteFlameResistanceEffects),
    {
      activation: "active",
      exclusivity: { group: "durin-light-spirit-manifestation", variant: "dark-decay-dragon" },
      id: "durin.passive.light_spirit.dark_decay_dragon.vaporize_melt_bonus",
      label: "光灵遵神数显现 · 黑蚀之龙蒸发与融化伤害提升",
      source: { characterId: "Durin", kind: "character", minimumSourceAscension: 1 },
      target: "amplifyingReactionBonus",
      targetFilter: {
        amplifyingReactionKinds: ["melt_forward", "vaporize_reverse"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.4 }
    },
    {
      activation: "active",
      condition: { kind: "hexerei_secret_rite" },
      id: "durin.locked_passive.sublimation_hymn.dark_decay_dragon.extra_vaporize_melt_bonus",
      label: "魔女的前夜礼·升华赞歌 · 黑蚀之龙蒸发与融化伤害额外提升",
      requiredActiveEffectIds: ["durin.passive.light_spirit.dark_decay_dragon.vaporize_melt_bonus"],
      source: { characterId: "Durin", kind: "character" },
      target: "amplifyingReactionBonus",
      targetFilter: {
        amplifyingReactionKinds: ["melt_forward", "vaporize_reverse"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.3 }
    },
    {
      activation: "active",
      id: "durin.constellation.6.dual_birth.white_flame.enemy_defense_reduction",
      label: "双重诞生 · C6 白化法或白焰之龙命中后目标防御力降低30%（6秒）",
      source: { characterId: "Durin", kind: "character", minimumSourceConstellation: 6 },
      target: "enemyDefenseReduction",
      value: { kind: "fixed", value: 0.3 }
    }
  ],
  metrics: [
    {
      actionId: "durin.skill.binary_formula.purity_transformation",
      characterId: "Durin",
      id: "durin.skill.binary_formula.purity_transformation",
      kind: "damage",
      label: "二元式·聚分熔炼 / 转变·白化之是单次命中（无反应）",
      sourceActionId: "durin.skill.binary_formula.purity_transformation",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The selected metric is one Binary Formula Purity transformation hit. Light Spirit Manifestation's White-Flame resistance branches and Dark-Decay Vaporize/Melt bonus are explicit form snapshots; Sublimation Hymn adds the documented 75% numerical increase when Hexerei: Secret Rite is active. C6's White-form 30% enemy Defense Reduction is an explicit post-hit snapshot that can benefit a following action. Its universal 30% Burst DEF ignore and Dark-form additional 40% Burst DEF ignore do not alter this selected Skill hit. Burst sequences, dragon periodic damage, A4 stacks, timing, and rotation state remain unmodeled.",
  label: durinDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
