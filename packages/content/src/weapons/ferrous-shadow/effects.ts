import type { CombatActionEffect } from "../../combat/types.js"

export const FERROUS_SHADOW_LOW_HP_CHARGED_DAMAGE_BONUS = [0.3, 0.35, 0.4, 0.45, 0.5] as const

/** Typed selected low-health charged-damage contribution of Ferrous Shadow. */
export const ferrousShadowCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.ferrous-shadow.low-hp.charged-damage-bonus",
    label: "铁影阔剑 · 当前生命值低于精炼阈值时的重击伤害",
    source: { kind: "weapon", weaponId: "FerrousShadow" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["charged"] },
    value: { kind: "refinement_table", values: FERROUS_SHADOW_LOW_HP_CHARGED_DAMAGE_BONUS }
  }
]
