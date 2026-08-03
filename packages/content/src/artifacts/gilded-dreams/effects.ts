import type { CombatActionEffect } from "../../combat/types.js"

export const GILDED_DREAMS_TWO_PIECE_ELEMENTAL_MASTERY = 80
export const GILDED_DREAMS_ATTACK_PERCENT_PER_SAME_ELEMENT_TEAMMATE = 0.14
export const GILDED_DREAMS_ELEMENTAL_MASTERY_PER_DIFFERENT_ELEMENT_TEAMMATE = 50

const teammateCounts = [1, 2, 3] as const

function createSameElementTeammateEffect(
  teammateCount: (typeof teammateCounts)[number]
): CombatActionEffect {
  const suffix = teammateCount === 1 ? "teammate" : "teammates"
  return {
    activation: "active",
    condition: {
      kind: "primary_same_element_teammate_count",
      maximum: teammateCount,
      minimum: teammateCount
    },
    exclusivity: { group: "gilded-dreams-same-element-teammates", variant: `${teammateCount}-teammates` },
    id: `artifact.gilded-dreams.4pc.after-reaction.${teammateCount}-same-element-${suffix}.attack-percent`,
    label: `饰金之梦 · 当前核心动作前已触发元素反应：${teammateCount}名同元素队友攻击力（8秒内）`,
    source: { kind: "artifact_set", minimumPieces: 4, setId: "GildedDreams" },
    target: "attackPercent",
    value: { kind: "fixed", value: GILDED_DREAMS_ATTACK_PERCENT_PER_SAME_ELEMENT_TEAMMATE * teammateCount }
  }
}

function createDifferentElementTeammateEffect(
  teammateCount: (typeof teammateCounts)[number]
): CombatActionEffect {
  const suffix = teammateCount === 1 ? "teammate" : "teammates"
  return {
    activation: "active",
    condition: {
      kind: "primary_different_element_teammate_count",
      maximum: teammateCount,
      minimum: teammateCount
    },
    exclusivity: { group: "gilded-dreams-different-element-teammates", variant: `${teammateCount}-teammates` },
    id: `artifact.gilded-dreams.4pc.after-reaction.${teammateCount}-different-element-${suffix}.elemental-mastery`,
    label: `饰金之梦 · 当前核心动作前已触发元素反应：${teammateCount}名异元素队友元素精通（8秒内）`,
    source: { kind: "artifact_set", minimumPieces: 4, setId: "GildedDreams" },
    target: "elementalMastery",
    value: {
      kind: "fixed",
      value: GILDED_DREAMS_ELEMENTAL_MASTERY_PER_DIFFERENT_ELEMENT_TEAMMATE * teammateCount
    }
  }
}

/** Typed two-piece and explicit post-reaction party-composition contributions of Gilded Dreams. */
export const gildedDreamsCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.gilded-dreams.2pc.elemental-mastery",
    label: "饰金之梦 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "GildedDreams" },
    target: "elementalMastery",
    value: { kind: "fixed", value: GILDED_DREAMS_TWO_PIECE_ELEMENTAL_MASTERY }
  },
  ...teammateCounts.map(createSameElementTeammateEffect),
  ...teammateCounts.map(createDifferentElementTeammateEffect)
]
