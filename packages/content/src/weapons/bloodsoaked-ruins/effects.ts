import type { CombatActionEffect } from "../../combat/types.js"

export const BLOODSOAKED_RUINS_AFTER_LUNAR_CHARGED_CRIT_DAMAGE = [0.28, 0.35, 0.42, 0.49, 0.56] as const
export const BLOODSOAKED_RUINS_AFTER_BURST_LUNAR_CHARGED_DAMAGE_BONUS = [0.36, 0.48, 0.6, 0.72, 0.84] as const

/** Typed selected critical-damage state granted after Bloodsoaked Ruins triggers Lunar-Charged. */
export const bloodsoakedRuinsCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.bloodsoaked-ruins.after-burst.lunar-charged.reaction-damage-bonus",
    label: "血染荒城 · 元素爆发后的月感电伤害",
    source: { kind: "weapon", weaponId: "BloodsoakedRuins" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["lunar_charged"] },
    value: { kind: "refinement_table", values: BLOODSOAKED_RUINS_AFTER_BURST_LUNAR_CHARGED_DAMAGE_BONUS }
  },
  {
    activation: "active",
    id: "weapon.bloodsoaked-ruins.after-lunar-charged.crit-damage",
    label: "血染荒城 · 触发月感电后的暴击伤害",
    source: { kind: "weapon", weaponId: "BloodsoakedRuins" },
    target: "critDamage",
    value: { kind: "refinement_table", values: BLOODSOAKED_RUINS_AFTER_LUNAR_CHARGED_CRIT_DAMAGE }
  }
]
