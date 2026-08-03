import type { CombatActionEffect } from "../../combat/types.js"

export const CLOUDFORGED_ONE_STACK_ELEMENTAL_MASTERY = [40, 50, 60, 70, 80] as const
export const CLOUDFORGED_TWO_STACK_ELEMENTAL_MASTERY = [80, 100, 120, 140, 160] as const

/** Typed selected energy-reduction stacks of Cloudforged. */
export const cloudforgedCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    exclusivity: { group: "cloudforged-energy-reduced", variant: "one-stack" },
    id: "weapon.cloudforged.energy-reduced.1-stack.elemental-mastery",
    label: "筑云 · 元素能量减少后的1层元素精通",
    source: { kind: "weapon", weaponId: "Cloudforged" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: CLOUDFORGED_ONE_STACK_ELEMENTAL_MASTERY }
  },
  {
    activation: "active",
    exclusivity: { group: "cloudforged-energy-reduced", variant: "two-stack" },
    id: "weapon.cloudforged.energy-reduced.2-stack.elemental-mastery",
    label: "筑云 · 元素能量减少后的2层元素精通",
    source: { kind: "weapon", weaponId: "Cloudforged" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: CLOUDFORGED_TWO_STACK_ELEMENTAL_MASTERY }
  }
]
