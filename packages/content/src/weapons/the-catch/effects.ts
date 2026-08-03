import type { CombatActionEffect } from "../../combat/types.js"

export const THE_CATCH_BURST_DAMAGE_BONUS_BY_REFINEMENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const THE_CATCH_BURST_CRIT_RATE_BY_REFINEMENT = [0.06, 0.075, 0.09, 0.105, 0.12] as const

/** Typed automatic contributions of The Catch to any maintained Elemental Burst action. */
export const theCatchCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.the-catch.burst-crit-rate",
    label: "「渔获」· 元素爆发暴击率",
    source: { kind: "weapon", weaponId: "TheCatch" },
    target: "critRate",
    targetFilter: { talentSlots: ["burst"] },
    value: { kind: "refinement_table", values: THE_CATCH_BURST_CRIT_RATE_BY_REFINEMENT }
  },
  {
    activation: "automatic",
    id: "weapon.the-catch.burst-damage-bonus",
    label: "「渔获」· 元素爆发伤害",
    source: { kind: "weapon", weaponId: "TheCatch" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["burst"] },
    value: { kind: "refinement_table", values: THE_CATCH_BURST_DAMAGE_BONUS_BY_REFINEMENT }
  }
]

function valueAtRefinement(values: readonly number[], refinement: number): number {
  return values[Math.min(Math.max(refinement, 1), 5) - 1] ?? values[0] ?? 0
}

/** Returns The Catch's Elemental Burst damage bonus. */
export function getTheCatchBurstDamageBonus(refinement: number): number {
  return valueAtRefinement(THE_CATCH_BURST_DAMAGE_BONUS_BY_REFINEMENT, refinement)
}

/** Returns The Catch's Elemental Burst CRIT Rate bonus. */
export function getTheCatchBurstCritRate(refinement: number): number {
  return valueAtRefinement(THE_CATCH_BURST_CRIT_RATE_BY_REFINEMENT, refinement)
}
