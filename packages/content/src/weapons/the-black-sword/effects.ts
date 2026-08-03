import type { CombatActionEffect } from "../../combat/types.js"

export const THE_BLACK_SWORD_NORMAL_CHARGED_DAMAGE_BONUS_BY_REFINEMENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const

/** Typed automatic normal and charged attack contribution of The Black Sword. */
export const theBlackSwordCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.the-black-sword.normal-charged-damage-bonus",
    label: "黑剑 · 普通攻击与重击伤害",
    source: { kind: "weapon", weaponId: "TheBlackSword" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "refinement_table", values: THE_BLACK_SWORD_NORMAL_CHARGED_DAMAGE_BONUS_BY_REFINEMENT }
  }
]
