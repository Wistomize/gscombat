import type { CombatActionEffect } from "../../combat/types.js"

export const MISSIVE_WINDSPEAR_AFTER_REACTION_ATTACK_PERCENT = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const MISSIVE_WINDSPEAR_AFTER_REACTION_ELEMENTAL_MASTERY = [48, 60, 72, 84, 96] as const

/** Typed selected post-reaction contribution of Missive Windspear to maintained core actions. */
export const missiveWindspearCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.missive-windspear.after-reaction.attack-percent",
    label: "风信之锋 · 触发元素反应后10秒内（攻击力）",
    source: { kind: "weapon", weaponId: "MissiveWindspear" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: MISSIVE_WINDSPEAR_AFTER_REACTION_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "weapon.missive-windspear.after-reaction.elemental-mastery",
    label: "风信之锋 · 触发元素反应后10秒内（元素精通）",
    source: { kind: "weapon", weaponId: "MissiveWindspear" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: MISSIVE_WINDSPEAR_AFTER_REACTION_ELEMENTAL_MASTERY }
  }
]
