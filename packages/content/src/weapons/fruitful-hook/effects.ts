import type { CombatActionEffect } from "../../combat/types.js"

export const FRUITFUL_HOOK_PLUNGE_CRIT_RATE = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const FRUITFUL_HOOK_AFTER_PLUNGE_DAMAGE_BONUS = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed automatic and selected post-plunge contributions of Fruitful Hook. */
export const fruitfulHookCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.fruitful-hook.plunge-crit-rate",
    label: "硕果钩 · 下落攻击暴击率",
    source: { kind: "weapon", weaponId: "FruitfulHook" },
    target: "critRate",
    targetFilter: { attackKinds: ["plunge"] },
    value: { kind: "refinement_table", values: FRUITFUL_HOOK_PLUNGE_CRIT_RATE }
  },
  {
    activation: "active",
    id: "weapon.fruitful-hook.after-plunge.normal-charged-plunge-damage-bonus",
    label: "硕果钩 · 下落攻击命中后的普通攻击、重击、下落攻击伤害",
    source: { kind: "weapon", weaponId: "FruitfulHook" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged", "plunge"] },
    value: { kind: "refinement_table", values: FRUITFUL_HOOK_AFTER_PLUNGE_DAMAGE_BONUS }
  }
]
