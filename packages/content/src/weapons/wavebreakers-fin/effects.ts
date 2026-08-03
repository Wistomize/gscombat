import type { CombatActionEffect } from "../../combat/types.js"

const damagePerEnergyByRefinement = [0.0012, 0.0015, 0.0018, 0.0021, 0.0024] as const
const damageCapByRefinement = [0.4, 0.5, 0.6, 0.7, 0.8] as const

/** Typed automatic Burst contribution of Wavebreaker's Fin from the configured party's Burst costs. */
export const wavebreakersFinCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.wavebreakers-fin.burst-damage-bonus",
    label: "断浪长鳍 · 全队元素爆发能量",
    source: { kind: "weapon", weaponId: "WavebreakersFin" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["burst"] },
    value: {
      kind: "team_burst_energy_cost",
      maximumValue: { kind: "refinement_table", values: damageCapByRefinement },
      multiplier: { kind: "refinement_table", values: damagePerEnergyByRefinement },
      requiresFullParty: true
    }
  }
]

/** Returns Wavebreaker's Fin Burst damage bonus from the team's combined Burst cost. */
export function getWavebreakersFinBurstDamageBonus(refinement: number, teamBurstEnergyCost: number): number {
  const index = Math.min(Math.max(refinement, 1), 5) - 1
  const damagePerEnergy = damagePerEnergyByRefinement[index] ?? damagePerEnergyByRefinement[0]
  const cap = damageCapByRefinement[index] ?? damageCapByRefinement[0]
  return Math.min(teamBurstEnergyCost * damagePerEnergy, cap)
}
