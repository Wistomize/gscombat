import type { CombatActionEffect } from "../../combat/types.js"

export const LOST_PRAYER_ALL_ELEMENT_DAMAGE_BONUS_PER_STACK = [0.08, 0.1, 0.12, 0.14, 0.16] as const

const stackCounts = [1, 2, 3, 4] as const
const elementalDamageElements = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] as const

function getDamageBonusValues(stackCount: number): readonly number[] {
  return LOST_PRAYER_ALL_ELEMENT_DAMAGE_BONUS_PER_STACK.map((value) => value * stackCount)
}

function createStackEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    selectionMode: "optional",
    exclusivity: { group: "lost-prayer-movement", variant: `${stackCount}-stack` },
    id: `weapon.lost-prayer-to-the-sacred-winds.movement.${stackCount}-stack.all-element-damage-bonus`,
    label: `四风原典 · 登场后的${stackCount}层所有元素伤害`,
    source: { kind: "weapon", weaponId: "LostPrayerToTheSacredWinds" },
    target: "damageBonus",
    targetFilter: { elements: elementalDamageElements },
    value: { kind: "refinement_table", values: getDamageBonusValues(stackCount) }
  }
}

/** Typed selected on-field movement stacks of Lost Prayer to the Sacred Winds. */
export const lostPrayerToTheSacredWindsCombatActionEffects: readonly CombatActionEffect[] = stackCounts.map(
  createStackEffect
)
