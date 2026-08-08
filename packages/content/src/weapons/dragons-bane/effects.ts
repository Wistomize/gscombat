import type { CombatActionEffect } from "../../combat/types.js"

export const DRAGONS_BANE_HYDRO_OR_PYRO_AURA_DAMAGE_BONUS = [0.2, 0.24, 0.28, 0.32, 0.36] as const

/** Typed selected target-aura contribution of Dragon's Bane to maintained core actions. */
export const dragonsBaneCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    selectionMode: "optional",
    id: "weapon.dragons-bane.hydro-or-pyro-aura.damage-bonus",
    label: "匣里灭辰 · 当前目标受水元素或火元素影响",
    source: { kind: "weapon", weaponId: "DragonsBane" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: DRAGONS_BANE_HYDRO_OR_PYRO_AURA_DAMAGE_BONUS }
  }
]
