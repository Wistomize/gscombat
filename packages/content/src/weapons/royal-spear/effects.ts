import type { CombatActionEffect } from "../../combat/types.js"

export const ROYAL_SPEAR_CRIT_RATE_PER_STACK = [0.08, 0.1, 0.12, 0.14, 0.16] as const

const stackCounts = [1, 2, 3, 4, 5] as const

function getCritRateValues(stackCount: number): readonly number[] {
  return ROYAL_SPEAR_CRIT_RATE_PER_STACK.map((value) => value * stackCount)
}

function createStackEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "royal-spear-focus", variant: `${stackCount}-stack` },
    id: `weapon.royal-spear.focus.${stackCount}-stack.crit-rate`,
    label: `宗室猎枪 · 本次命中前${stackCount}层专注暴击率`,
    source: { kind: "weapon", weaponId: "RoyalSpear" },
    target: "critRate",
    value: { kind: "refinement_table", values: getCritRateValues(stackCount) }
  }
}

/** Typed selected pre-hit Focus stack contributions of Royal Spear. */
export const royalSpearCombatActionEffects: readonly CombatActionEffect[] = stackCounts.map(createStackEffect)
