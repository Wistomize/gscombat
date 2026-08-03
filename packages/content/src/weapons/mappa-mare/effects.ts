import type { CombatActionEffect } from "../../combat/types.js"

export const MAPPA_MARE_ALL_ELEMENT_DAMAGE_BONUS_PER_STACK = [0.08, 0.1, 0.12, 0.14, 0.16] as const

const stackCounts = [1, 2] as const
const elementalDamageElements = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] as const

function getDamageBonusValues(stackCount: number): readonly number[] {
  return MAPPA_MARE_ALL_ELEMENT_DAMAGE_BONUS_PER_STACK.map((value) => value * stackCount)
}

function createStackEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "mappa-mare-infusion-scroll", variant: `${stackCount}-stack` },
    id: `weapon.mappa-mare.infusion-scroll.${stackCount}-stack.all-element-damage-bonus`,
    label: `万国诸海图谱 · 触发元素反应后的${stackCount}层所有元素伤害`,
    source: { kind: "weapon", weaponId: "MappaMare" },
    target: "damageBonus",
    targetFilter: { elements: elementalDamageElements },
    value: { kind: "refinement_table", values: getDamageBonusValues(stackCount) }
  }
}

/** Typed selected Infusion Scroll stack contributions of Mappa Mare. */
export const mappaMareCombatActionEffects: readonly CombatActionEffect[] = stackCounts.map(createStackEffect)
