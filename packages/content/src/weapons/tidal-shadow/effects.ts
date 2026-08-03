import type { CombatActionEffect } from "../../combat/types.js"

export const TIDAL_SHADOW_AFTER_HEAL_ATTACK_PERCENT = [0.24, 0.3, 0.36, 0.42, 0.48] as const

/** Typed selected post-healing attack contribution of Tidal Shadow. */
export const tidalShadowCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.tidal-shadow.after-heal.attack-percent",
    label: "浪影阔剑 · 受到治疗后8秒内",
    source: { kind: "weapon", weaponId: "TidalShadow" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: TIDAL_SHADOW_AFTER_HEAL_ATTACK_PERCENT }
  }
]
