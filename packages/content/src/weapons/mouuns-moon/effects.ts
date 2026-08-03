import type { CombatActionEffect } from "../../combat/types.js"

export const MOUUNS_MOON_DAMAGE_PER_ENERGY_BY_REFINEMENT = [0.0012, 0.0015, 0.0018, 0.0021, 0.0024] as const
export const MOUUNS_MOON_DAMAGE_CAP_BY_REFINEMENT = [0.4, 0.5, 0.6, 0.7, 0.8] as const

/** Typed automatic Burst contribution of Mouun's Moon from the configured party's Burst costs. */
export const mouunsMoonCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.mouuns-moon.burst-damage-bonus",
    label: "曚云之月 · 全队元素能量上限",
    source: { kind: "weapon", weaponId: "MouunsMoon" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["burst"] },
    value: {
      kind: "team_burst_energy_cost",
      maximumValue: { kind: "refinement_table", values: MOUUNS_MOON_DAMAGE_CAP_BY_REFINEMENT },
      multiplier: { kind: "refinement_table", values: MOUUNS_MOON_DAMAGE_PER_ENERGY_BY_REFINEMENT },
      requiresFullParty: true
    }
  }
]
