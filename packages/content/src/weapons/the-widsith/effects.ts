import type { CombatActionEffect } from "../../combat/types.js"

export const THE_WIDSITH_RECITATIVE_ATTACK_PERCENT = [0.6, 0.75, 0.9, 1.05, 1.2] as const
export const THE_WIDSITH_ARIA_ALL_ELEMENT_DAMAGE_BONUS = [0.48, 0.6, 0.72, 0.84, 0.96] as const
export const THE_WIDSITH_INTERLUDE_ELEMENTAL_MASTERY = [240, 300, 360, 420, 480] as const

const elementalDamageElements = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] as const

/** Typed selected theme contribution of The Widsith. */
export const theWidsithCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    exclusivity: { group: "the-widsith-theme", variant: "recitative" },
    id: "weapon.the-widsith.recitative.attack-percent",
    label: "流浪乐章 · 登场主题：攻击力",
    selectionMode: "optional",
    source: { kind: "weapon", weaponId: "TheWidsith" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: THE_WIDSITH_RECITATIVE_ATTACK_PERCENT }
  },
  {
    activation: "active",
    exclusivity: { group: "the-widsith-theme", variant: "aria" },
    id: "weapon.the-widsith.aria.all-element-damage-bonus",
    label: "流浪乐章 · 登场主题：所有元素伤害",
    selectionMode: "optional",
    source: { kind: "weapon", weaponId: "TheWidsith" },
    target: "damageBonus",
    targetFilter: { elements: elementalDamageElements },
    value: { kind: "refinement_table", values: THE_WIDSITH_ARIA_ALL_ELEMENT_DAMAGE_BONUS }
  },
  {
    activation: "active",
    exclusivity: { group: "the-widsith-theme", variant: "interlude" },
    id: "weapon.the-widsith.interlude.elemental-mastery",
    label: "流浪乐章 · 登场主题：元素精通",
    selectionMode: "optional",
    source: { kind: "weapon", weaponId: "TheWidsith" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: THE_WIDSITH_INTERLUDE_ELEMENTAL_MASTERY }
  }
]
