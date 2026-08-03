import type { CombatActionEffect } from "../../combat/types.js"

export const AKUOUMARU_DAMAGE_PER_ENERGY_BY_REFINEMENT = [0.0012, 0.0015, 0.0018, 0.0021, 0.0024] as const
export const AKUOUMARU_DAMAGE_CAP_BY_REFINEMENT = [0.4, 0.5, 0.6, 0.7, 0.8] as const

/** Typed automatic Burst contribution of Akuoumaru from the configured party's Burst costs. */
export const akuoumaruCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.akuoumaru.burst-damage-bonus",
    label: "恶王丸 · 全队元素爆发能量上限",
    source: { kind: "weapon", weaponId: "Akuoumaru" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["burst"] },
    value: {
      kind: "team_burst_energy_cost",
      maximumValue: { kind: "refinement_table", values: AKUOUMARU_DAMAGE_CAP_BY_REFINEMENT },
      multiplier: { kind: "refinement_table", values: AKUOUMARU_DAMAGE_PER_ENERGY_BY_REFINEMENT },
      requiresFullParty: true
    }
  }
]
