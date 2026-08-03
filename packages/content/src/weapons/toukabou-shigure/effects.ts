import type { CombatActionEffect } from "../../combat/types.js"

export const TOUKABOU_SHIGURE_CURSED_PARASOL_DAMAGE_BONUS = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed selected target-mark contribution of Toukabou Shigure to maintained core actions. */
export const toukabouShigureCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.toukabou-shigure.cursed-parasol-target.damage-bonus",
    label: "东花坊时雨 · 当前目标处于纸伞作祟状态",
    source: { kind: "weapon", weaponId: "ToukabouShigure" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: TOUKABOU_SHIGURE_CURSED_PARASOL_DAMAGE_BONUS }
  }
]
