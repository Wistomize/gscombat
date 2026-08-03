import type { CombatActionEffect } from "../../combat/types.js"

export const RUST_NORMAL_DAMAGE_BONUS_BY_REFINEMENT = [0.4, 0.5, 0.6, 0.7, 0.8] as const
export const RUST_CHARGED_DAMAGE_BONUS_BY_REFINEMENT = [-0.1, -0.1, -0.1, -0.1, -0.1] as const

/** Typed automatic normal and charged attack contributions of Rust. */
export const rustCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.rust.normal-damage-bonus",
    label: "弓藏 · 普通攻击伤害",
    source: { kind: "weapon", weaponId: "Rust" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal"] },
    value: { kind: "refinement_table", values: RUST_NORMAL_DAMAGE_BONUS_BY_REFINEMENT }
  },
  {
    activation: "automatic",
    id: "weapon.rust.charged-damage-penalty",
    label: "弓藏 · 重击伤害降低",
    source: { kind: "weapon", weaponId: "Rust" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["charged"] },
    value: { kind: "refinement_table", values: RUST_CHARGED_DAMAGE_BONUS_BY_REFINEMENT }
  }
]
