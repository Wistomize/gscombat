import type { CombatActionEffect } from "../../combat/types.js"

export const ROYAL_BOW_CRIT_RATE_PER_STACK = [0.08, 0.1, 0.12, 0.14, 0.16] as const

const stackCounts = [1, 2, 3, 4, 5] as const

function getCritRateValues(stackCount: number): readonly number[] {
  return ROYAL_BOW_CRIT_RATE_PER_STACK.map((value) => value * stackCount)
}

function createStackEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "royal-bow-focus", variant: `${stackCount}-stack` },
    id: `weapon.royal-bow.focus.${stackCount}-stack.crit-rate`,
    label: `宗室长弓 · 本次命中前${stackCount}层专注暴击率`,
    source: { kind: "weapon", weaponId: "RoyalBow" },
    target: "critRate",
    value: { kind: "refinement_table", values: getCritRateValues(stackCount) }
  }
}

/** Typed selected pre-hit Focus stack contributions of Royal Bow. */
export const royalBowCombatActionEffects: readonly CombatActionEffect[] = stackCounts.map(createStackEffect)
