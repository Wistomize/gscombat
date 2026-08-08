import type { CombatActionEffect } from "../../combat/types.js"

export const PROTOTYPE_CRESCENT_AFTER_WEAK_POINT_ATTACK_PERCENT = [0.36, 0.45, 0.54, 0.63, 0.72] as const

/** Typed selected post-weak-point-hit contribution of Prototype Crescent. */
export const prototypeCrescentCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    selectionMode: "optional",
    id: "weapon.prototype-crescent.after-weak-point-hit.attack-percent",
    label: "试作澹月 · 重击命中要害后10秒内（当前动作前已生效）",
    source: { kind: "weapon", weaponId: "PrototypeCrescent" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: PROTOTYPE_CRESCENT_AFTER_WEAK_POINT_ATTACK_PERCENT }
  }
]
