import type { CombatActionEffect } from "../../combat/types.js"

export const AQUILA_FAVONIA_ATTACK_PERCENT_BY_REFINEMENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const

/** Typed automatic attack contribution of Aquila Favonia to any maintained action. */
export const aquilaFavoniaCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.aquila-favonia.attack",
    label: "风鹰剑 · 攻击力",
    source: { kind: "weapon", weaponId: "AquilaFavonia" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: AQUILA_FAVONIA_ATTACK_PERCENT_BY_REFINEMENT }
  }
]
