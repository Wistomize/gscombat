import type { CombatActionEffect } from "../../combat/types.js"

export const THE_STRINGLESS_SKILL_BURST_DAMAGE_BONUS_BY_REFINEMENT = [0.24, 0.3, 0.36, 0.42, 0.48] as const

/** Typed automatic Elemental Skill and Elemental Burst contribution of The Stringless. */
export const theStringlessCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.the-stringless.skill-burst-damage-bonus",
    label: "绝弦 · 元素战技与元素爆发伤害",
    source: { kind: "weapon", weaponId: "TheStringless" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill", "burst"] },
    value: { kind: "refinement_table", values: THE_STRINGLESS_SKILL_BURST_DAMAGE_BONUS_BY_REFINEMENT }
  }
]
