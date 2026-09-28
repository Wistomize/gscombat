import type { CombatActionEffect } from "../../combat/types.js"
import { withWeaponToggle } from "../../combat/weapon-preparation.js"

export const FERROUS_SHADOW_LOW_HP_CHARGED_DAMAGE_BONUS = [0.3, 0.35, 0.4, 0.45, 0.5] as const

/** Typed selected low-health charged-damage contribution of Ferrous Shadow. */
const authoredEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    selectionMode: "optional",
    id: "weapon.ferrous-shadow.low-hp.charged-damage-bonus",
    label: "铁影阔剑 · 当前生命值低于精炼阈值时的重击伤害",
    source: { kind: "weapon", weaponId: "FerrousShadow" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["charged"] },
    value: { kind: "refinement_table", values: FERROUS_SHADOW_LOW_HP_CHARGED_DAMAGE_BONUS }
  }
]

export const ferrousShadowCombatActionEffects: readonly CombatActionEffect[] = authoredEffects.flatMap((effect) =>
  effect.activation === "active" ? withWeaponToggle(effect, "ferrous-shadow-low-hp", "生命值低于精炼门槛", false).map((variant) => ({
    ...variant, weaponChoice: { ...variant.weaponChoice!, labelByRefinement: [70, 75, 80, 85, 90].map((value) => `生命值低于${value}%`) }
  })) : [effect]
)
