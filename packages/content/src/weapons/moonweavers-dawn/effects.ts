import type { CombatActionEffect } from "../../combat/types.js"

export const MOONWEAVERS_DAWN_BURST_DAMAGE_BONUS = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const MOONWEAVERS_DAWN_AT_MOST_SIXTY_ENERGY_EXTRA_DAMAGE_BONUS = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const MOONWEAVERS_DAWN_AT_MOST_FORTY_ENERGY_EXTRA_DAMAGE_BONUS = [0.28, 0.35, 0.42, 0.49, 0.56] as const

/** Typed burst and selected energy-cap snapshots of Moonweaver's Dawn. */
export const moonweaversDawnCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.moonweavers-dawn.burst-damage-bonus",
    label: "织月者的曙色 · 元素爆发伤害",
    source: { kind: "weapon", weaponId: "MoonweaversDawn" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["burst"] },
    value: { kind: "refinement_table", values: MOONWEAVERS_DAWN_BURST_DAMAGE_BONUS }
  },
  {
    activation: "active",
    exclusivity: { group: "moonweavers-dawn-energy-cap", variant: "at-most-sixty" },
    id: "weapon.moonweavers-dawn.at-most-sixty-energy.extra-burst-damage-bonus",
    label: "织月者的曙色 · 元素能量上限不超过60时的额外元素爆发伤害",
    source: { kind: "weapon", weaponId: "MoonweaversDawn" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["burst"] },
    value: { kind: "refinement_table", values: MOONWEAVERS_DAWN_AT_MOST_SIXTY_ENERGY_EXTRA_DAMAGE_BONUS }
  },
  {
    activation: "active",
    exclusivity: { group: "moonweavers-dawn-energy-cap", variant: "at-most-forty" },
    id: "weapon.moonweavers-dawn.at-most-forty-energy.extra-burst-damage-bonus",
    label: "织月者的曙色 · 元素能量上限不超过40时的额外元素爆发伤害",
    source: { kind: "weapon", weaponId: "MoonweaversDawn" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["burst"] },
    value: { kind: "refinement_table", values: MOONWEAVERS_DAWN_AT_MOST_FORTY_ENERGY_EXTRA_DAMAGE_BONUS }
  }
]
