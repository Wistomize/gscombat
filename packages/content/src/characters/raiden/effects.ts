import type { DefenseIgnoreModifier, Modifier } from "@gscombat/calculator"

export const RAIDEN_BURST_ENERGY_COST = 90

/** Converts Raiden's energy recharge above 100% into Electro damage bonus. */
export function getRaidenElectroDamageBonus(energyRecharge: number): number {
  return Math.max(energyRecharge - 1, 0) * 0.4
}

/** Returns Raiden C2's burst-only defense ignore when the constellation is active. */
export function createRaidenC2Modifier(constellation: number): DefenseIgnoreModifier | undefined {
  if (constellation < 2) return undefined
  return {
    filter: { ownerId: "raiden", talent: "burst" },
    kind: "defense_ignore",
    source: "raiden.constellation.2",
    value: 0.6
  }
}

export const illustrativeResolveModifier: Modifier = {
  filter: { talent: "burst" },
  kind: "talent_multiplier_bonus",
  source: "raiden.resolve_illustrative",
  value: 0.4
}
