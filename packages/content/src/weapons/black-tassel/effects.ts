import type { CombatActionEffect } from "../../combat/types.js"

export const BLACK_TASSEL_SLIME_DAMAGE_BONUS = [0.4, 0.5, 0.6, 0.7, 0.8] as const

/** Typed selected current-slime-target damage contribution of Black Tassel. */
export const blackTasselCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.black-tassel.slime-target.damage-bonus",
    label: "黑缨枪 · 当前目标为史莱姆类敌人时的伤害",
    source: { kind: "weapon", weaponId: "BlackTassel" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: BLACK_TASSEL_SLIME_DAMAGE_BONUS }
  }
]
