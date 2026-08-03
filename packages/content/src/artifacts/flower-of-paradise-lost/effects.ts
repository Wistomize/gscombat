import type { CombatActionEffect } from "../../combat/types.js"

export const FLOWER_OF_PARADISE_LOST_TWO_PIECE_ELEMENTAL_MASTERY = 80
export const FLOWER_OF_PARADISE_LOST_BASE_REACTION_DAMAGE_BONUS = 0.4
export const FLOWER_OF_PARADISE_LOST_REACTION_DAMAGE_BONUS_STACK_MULTIPLIER = 0.25
export const FLOWER_OF_PARADISE_LOST_REACTION_DAMAGE_BONUS_BY_STACK = [0.4, 0.5, 0.6, 0.7, 0.8] as const

const reactionDamageBonusStackCounts = [0, 1, 2, 3, 4] as const

function getReactionDamageBonus(stackCount: (typeof reactionDamageBonusStackCounts)[number]): number {
  const bonus = FLOWER_OF_PARADISE_LOST_REACTION_DAMAGE_BONUS_BY_STACK[stackCount]
  if (bonus === undefined) throw new Error("Flower of Paradise Lost reaction damage bonus is unavailable")
  return bonus
}

function createReactionDamageBonusEffect(
  stackCount: (typeof reactionDamageBonusStackCounts)[number]
): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "flower-of-paradise-lost-reaction-trigger", variant: `${stackCount}-stack` },
    id: `artifact.flower-of-paradise-lost.4pc.reaction-trigger.${stackCount}-stack.reaction-damage-bonus`,
    label: `乐园遗落之花 · 四件套（绽放、超绽放、烈绽放反应触发${stackCount}层；10秒内）`,
    source: { kind: "artifact_set", minimumPieces: 4, setId: "FlowerOfParadiseLost" },
    target: "reactionDamageBonus",
    targetFilter: { reactionKinds: ["bloom", "hyperbloom", "burgeon"] },
    value: { kind: "fixed", value: getReactionDamageBonus(stackCount) }
  }
}

/** Typed two-piece and explicit reaction-trigger stack contributions of Flower of Paradise Lost. */
export const flowerOfParadiseLostCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.flower-of-paradise-lost.2pc.elemental-mastery",
    label: "乐园遗落之花 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "FlowerOfParadiseLost" },
    target: "elementalMastery",
    value: { kind: "fixed", value: FLOWER_OF_PARADISE_LOST_TWO_PIECE_ELEMENTAL_MASTERY }
  },
  ...reactionDamageBonusStackCounts.map(createReactionDamageBonusEffect)
]
