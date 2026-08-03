import type { CombatActionEffect } from "../../combat/types.js"

export const MISTSPLITTER_REFORGED_ALL_ELEMENT_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const MISTSPLITTER_REFORGED_ONE_EMBLEM_DAMAGE_BONUS = [0.08, 0.1, 0.12, 0.14, 0.16] as const
export const MISTSPLITTER_REFORGED_TWO_EMBLEM_DAMAGE_BONUS = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const MISTSPLITTER_REFORGED_THREE_EMBLEM_DAMAGE_BONUS = [0.28, 0.35, 0.42, 0.49, 0.56] as const

const elementalDamageElements = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] as const
const elementalLabels = {
  anemo: "风",
  cryo: "冰",
  dendro: "草",
  electro: "雷",
  geo: "岩",
  hydro: "水",
  pyro: "火"
} as const
const emblemStackEffects = [
  { stackCount: 1, values: MISTSPLITTER_REFORGED_ONE_EMBLEM_DAMAGE_BONUS },
  { stackCount: 2, values: MISTSPLITTER_REFORGED_TWO_EMBLEM_DAMAGE_BONUS },
  { stackCount: 3, values: MISTSPLITTER_REFORGED_THREE_EMBLEM_DAMAGE_BONUS }
] as const

function createEmblemEffect(
  element: (typeof elementalDamageElements)[number],
  stack: (typeof emblemStackEffects)[number]
): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "mistsplitter-reforged-emblem", variant: `${element}-${stack.stackCount}-stack` },
    id: `weapon.mistsplitter-reforged.emblem.${element}.${stack.stackCount}-stack.damage-bonus`,
    label: `雾切之回光 · ${elementalLabels[element]}元素${stack.stackCount}层雾切之巴伤害`,
    source: { kind: "weapon", weaponId: "MistsplitterReforged" },
    target: "damageBonus",
    targetFilter: { elements: [element] },
    value: { kind: "refinement_table", values: stack.values }
  }
}

/** Typed automatic elemental and selected native-element Mistsplitter Emblem contributions. */
export const mistsplitterReforgedCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.mistsplitter-reforged.all-element-damage-bonus",
    label: "雾切之回光 · 所有元素伤害",
    source: { kind: "weapon", weaponId: "MistsplitterReforged" },
    target: "damageBonus",
    targetFilter: { elements: elementalDamageElements },
    value: { kind: "refinement_table", values: MISTSPLITTER_REFORGED_ALL_ELEMENT_DAMAGE_BONUS }
  },
  ...elementalDamageElements.flatMap((element) => emblemStackEffects.map((stack) => createEmblemEffect(element, stack)))
]
