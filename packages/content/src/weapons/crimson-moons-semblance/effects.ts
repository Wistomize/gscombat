import type { CombatActionEffect } from "../../combat/types.js"

export const CRIMSON_MOONS_SEMBLANCE_BOND_DAMAGE_BONUS = [0.12, 0.16, 0.2, 0.24, 0.28] as const
export const CRIMSON_MOONS_SEMBLANCE_HIGH_BOND_DAMAGE_BONUS = [0.36, 0.48, 0.6, 0.72, 0.84] as const

/** Typed selected Bond of Life contributions of Crimson Moon's Semblance. */
export const crimsonMoonsSemblanceCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    exclusivity: { group: "crimson-moons-semblance-bond", variant: "below-thirty-percent" },
    id: "weapon.crimson-moons-semblance.bond-of-life.below-thirty-percent.damage-bonus",
    label: "赤月之形 · 具有低于生命值上限30%的生命之契时造成的伤害",
    source: { kind: "weapon", weaponId: "CrimsonMoonsSemblance" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: CRIMSON_MOONS_SEMBLANCE_BOND_DAMAGE_BONUS }
  },
  {
    activation: "active",
    exclusivity: { group: "crimson-moons-semblance-bond", variant: "at-least-thirty-percent" },
    id: "weapon.crimson-moons-semblance.bond-of-life.at-least-thirty-percent.damage-bonus",
    label: "赤月之形 · 生命之契不低于生命值上限30%时造成的伤害",
    source: { kind: "weapon", weaponId: "CrimsonMoonsSemblance" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: CRIMSON_MOONS_SEMBLANCE_HIGH_BOND_DAMAGE_BONUS }
  }
]
