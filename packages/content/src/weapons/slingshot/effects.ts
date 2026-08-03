import type { CombatActionEffect } from "../../combat/types.js"

export const SLINGSHOT_WITHIN_POINT_THREE_SECONDS_DAMAGE_BONUS = [0.36, 0.42, 0.48, 0.54, 0.6] as const
export const SLINGSHOT_AFTER_POINT_THREE_SECONDS_DAMAGE_PENALTY = [-0.1, -0.1, -0.1, -0.1, -0.1] as const

/** Typed selected arrow-flight-time contribution of Slingshot. */
export const slingshotCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    exclusivity: { group: "slingshot-flight-time", variant: "within-0.3-seconds" },
    id: "weapon.slingshot.flight-time.within-0.3-seconds.damage-bonus",
    label: "弹弓 · 本次普攻或重击箭矢在0.3秒内命中时的伤害",
    source: { kind: "weapon", weaponId: "Slingshot" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "refinement_table", values: SLINGSHOT_WITHIN_POINT_THREE_SECONDS_DAMAGE_BONUS }
  },
  {
    activation: "active",
    exclusivity: { group: "slingshot-flight-time", variant: "after-0.3-seconds" },
    id: "weapon.slingshot.flight-time.after-0.3-seconds.damage-penalty",
    label: "弹弓 · 本次普攻或重击箭矢在0.3秒后命中时的伤害降低",
    source: { kind: "weapon", weaponId: "Slingshot" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "refinement_table", values: SLINGSHOT_AFTER_POINT_THREE_SECONDS_DAMAGE_PENALTY }
  }
]
