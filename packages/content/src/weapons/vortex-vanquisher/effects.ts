import type { CombatActionEffect } from "../../combat/types.js"

export const VORTEX_VANQUISHER_ATTACK_PERCENT_PER_STACK = [0.04, 0.05, 0.06, 0.07, 0.08] as const

const stackCounts = [1, 2, 3, 4, 5] as const

function getAttackPercentValues(stackCount: number, shielded: boolean): readonly number[] {
  const multiplier = shielded ? stackCount * 2 : stackCount
  return VORTEX_VANQUISHER_ATTACK_PERCENT_PER_STACK.map((value) => value * multiplier)
}

function createStackEffect(
  stackCount: (typeof stackCounts)[number],
  shielded: boolean
): CombatActionEffect {
  const state = shielded ? "shielded" : "unshielded"
  const stateLabel = shielded ? "受护盾庇护时" : "未受护盾庇护时"
  return {
    activation: "active",
    exclusivity: { group: "vortex-vanquisher-golden-majesty", variant: state + "-" + stackCount + "-stack" },
    id: "weapon.vortex-vanquisher.golden-majesty." + state + "." + stackCount + "-stack.attack-percent",
    label: "贯虹之槊 · " + stateLabel + stackCount + "层攻击力",
    source: { kind: "weapon", weaponId: "VortexVanquisher" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: getAttackPercentValues(stackCount, shielded) }
  }
}

/** Typed selected shield-state and stack contributions of Vortex Vanquisher. */
export const vortexVanquisherCombatActionEffects: readonly CombatActionEffect[] = [
  ...stackCounts.map((stackCount) => createStackEffect(stackCount, false)),
  ...stackCounts.map((stackCount) => createStackEffect(stackCount, true))
]
