import type { CombatActionEffect } from "../../combat/types.js"

export const PRIMORDIAL_JADE_WINGED_SPEAR_ATTACK_PERCENT_PER_STACK = [0.032, 0.039, 0.046, 0.053, 0.06] as const
export const PRIMORDIAL_JADE_WINGED_SPEAR_SEVEN_STACK_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const

const stackCounts = [1, 2, 3, 4, 5, 6, 7] as const

function getAttackPercentValues(stackCount: number): readonly number[] {
  return PRIMORDIAL_JADE_WINGED_SPEAR_ATTACK_PERCENT_PER_STACK.map((value) => value * stackCount)
}

function createStackEffects(stackCount: (typeof stackCounts)[number]): readonly CombatActionEffect[] {
  const exclusivity = { group: "primordial-jade-winged-spear-eagle-spear", variant: `${stackCount}-stack` }
  const effects: CombatActionEffect[] = [
    {
      activation: "active",
      exclusivity,
      id: `weapon.primordial-jade-winged-spear.eagle-spear.${stackCount}-stack.attack-percent`,
      label: `和璞鸢 · ${stackCount}层鹰之傲攻击力`,
      source: { kind: "weapon", weaponId: "PrimordialJadeWingedSpear" },
      target: "attackPercent",
      value: { kind: "refinement_table", values: getAttackPercentValues(stackCount) }
    }
  ]
  if (stackCount === 7) {
    effects.push({
      activation: "active",
      exclusivity,
      id: "weapon.primordial-jade-winged-spear.eagle-spear.7-stack.damage-bonus",
      label: "和璞鸢 · 七层鹰之傲全伤害",
      source: { kind: "weapon", weaponId: "PrimordialJadeWingedSpear" },
      target: "damageBonus",
      value: { kind: "refinement_table", values: PRIMORDIAL_JADE_WINGED_SPEAR_SEVEN_STACK_DAMAGE_BONUS }
    })
  }
  return effects
}

/** Typed selected Eagle Spear stack contributions of Primordial Jade Winged-Spear. */
export const primordialJadeWingedSpearCombatActionEffects: readonly CombatActionEffect[] = stackCounts.flatMap(
  createStackEffects
)
