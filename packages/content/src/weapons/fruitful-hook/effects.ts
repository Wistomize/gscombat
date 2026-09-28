import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

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
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "plunge_access", provider: "party", recipient: "source" }, "前台本人具备合法下落准备", true),
    id: "weapon.fruitful-hook.after-plunge.normal-charged-plunge-damage-bonus",
    label: "硕果钩 · 下落攻击命中后的普通攻击、重击、下落攻击伤害",
    source: { kind: "weapon", weaponId: "FruitfulHook" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "refinement_table", values: FRUITFUL_HOOK_AFTER_PLUNGE_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    requiresSourceOnField: true,
    id: "weapon.fruitful-hook.plunge-metric.prepared-damage-bonus",
    label: "硕果钩 · 下落指标默认已提前完成一次下落命中",
    source: { kind: "weapon", weaponId: "FruitfulHook" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["plunge"] },
    value: { kind: "refinement_table", values: FRUITFUL_HOOK_AFTER_PLUNGE_DAMAGE_BONUS }
  }
]
