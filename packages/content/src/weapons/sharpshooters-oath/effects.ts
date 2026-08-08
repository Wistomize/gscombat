import type { CombatActionEffect } from "../../combat/types.js"

export const SHARPSHOOTERS_OATH_WEAK_POINT_DAMAGE_BONUS = [0.24, 0.3, 0.36, 0.42, 0.48] as const

/** Typed selected current weak-point-hit damage contribution of Sharpshooter's Oath. */
export const sharpshootersOathCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    selectionMode: "optional",
    id: "weapon.sharpshooters-oath.current-weak-point-hit.damage-bonus",
    label: "神射手之誓 · 本次命中敌人要害时的伤害",
    source: { kind: "weapon", weaponId: "SharpshootersOath" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: SHARPSHOOTERS_OATH_WEAK_POINT_DAMAGE_BONUS }
  }
]
