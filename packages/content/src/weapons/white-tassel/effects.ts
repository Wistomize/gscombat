import type { CombatActionEffect } from "../../combat/types.js"

export const WHITE_TASSEL_NORMAL_DAMAGE_BONUS_BY_REFINEMENT = [0.24, 0.3, 0.36, 0.42, 0.48] as const

/** Typed automatic normal-attack contribution of White Tassel. */
export const whiteTasselCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.white-tassel.normal-damage-bonus",
    label: "白缨枪 · 普通攻击伤害",
    source: { kind: "weapon", weaponId: "WhiteTassel" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal"] },
    value: { kind: "refinement_table", values: WHITE_TASSEL_NORMAL_DAMAGE_BONUS_BY_REFINEMENT }
  }
]
