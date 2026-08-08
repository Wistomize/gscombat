import type { CombatActionEffect } from "../../combat/types.js"

export const MEMORY_OF_DUST_ATTACK_PERCENT_PER_STACK = [0.04, 0.05, 0.06, 0.07, 0.08] as const

const stackCounts = [1, 2, 3, 4, 5] as const

function getAttackPercentValues(stackCount: number, shielded: boolean): readonly number[] {
  const multiplier = shielded ? stackCount * 2 : stackCount
  return MEMORY_OF_DUST_ATTACK_PERCENT_PER_STACK.map((value) => value * multiplier)
}

function createStackEffect(
  stackCount: (typeof stackCounts)[number],
  shielded: boolean
): CombatActionEffect {
  const state = shielded ? "shielded" : "unshielded"
  const stateLabel = shielded ? "受护盾庇护时" : "未受护盾庇护时"
  return {
    activation: "active",
    selectionMode: "optional",
    exclusivity: { group: "memory-of-dust-golden-majesty", variant: `${state}-${stackCount}-stack` },
    id: `weapon.memory-of-dust.golden-majesty.${state}.${stackCount}-stack.attack-percent`,
    label: `尘世之锁 · ${stateLabel}${stackCount}层攻击力`,
    source: { kind: "weapon", weaponId: "MemoryOfDust" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: getAttackPercentValues(stackCount, shielded) }
  }
}

/** Typed selected shield-state and stack contributions of Memory of Dust. */
export const memoryOfDustCombatActionEffects: readonly CombatActionEffect[] = [
  ...stackCounts.map((stackCount) => createStackEffect(stackCount, false)),
  ...stackCounts.map((stackCount) => createStackEffect(stackCount, true))
]
