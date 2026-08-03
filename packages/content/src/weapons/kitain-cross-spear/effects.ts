import type { CombatActionEffect } from "../../combat/types.js"

export const KITAIN_CROSS_SPEAR_SKILL_DAMAGE_BONUS_BY_REFINEMENT = [0.06, 0.075, 0.09, 0.105, 0.12] as const

/** Typed automatic Elemental Skill contribution of Kitain Cross Spear. */
export const kitainCrossSpearCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.kitain-cross-spear.skill-damage-bonus",
    label: "喜多院十文字 · 元素战技伤害",
    source: { kind: "weapon", weaponId: "KitainCrossSpear" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill"] },
    value: { kind: "refinement_table", values: KITAIN_CROSS_SPEAR_SKILL_DAMAGE_BONUS_BY_REFINEMENT }
  }
]
