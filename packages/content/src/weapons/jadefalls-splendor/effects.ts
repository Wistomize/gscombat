import type { CombatActionEffect } from "../../combat/types.js"

export const JADEFALLS_SPLENDOR_FINAL_HP_TO_OWN_ELEMENT_DAMAGE_BONUS_BY_REFINEMENT = [
  0.000003,
  0.000005,
  0.000007,
  0.000009,
  0.000011
] as const
export const JADEFALLS_SPLENDOR_OWN_ELEMENT_DAMAGE_BONUS_MAXIMUM_BY_REFINEMENT = [0.12, 0.2, 0.28, 0.36, 0.44] as const

/** Typed selected current-action snapshot for Jadefall's Splendor's Primordial Jade Regalia. */
export const jadefallsSplendorCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.jadefalls-splendor.after-burst-or-shield.final-hp-to-own-element-damage-bonus",
    label: "碧落之珑 · 施放元素爆发或创造护盾后3秒内的对应元素伤害",
    source: { holder: "primary", kind: "weapon", weaponId: "JadefallsSplendor" },
    target: "finalHpToOwnElementDamageBonus",
    value: {
      kind: "final_hp",
      maximumValue: {
        kind: "refinement_table",
        values: JADEFALLS_SPLENDOR_OWN_ELEMENT_DAMAGE_BONUS_MAXIMUM_BY_REFINEMENT
      },
      multiplier: {
        kind: "refinement_table",
        values: JADEFALLS_SPLENDOR_FINAL_HP_TO_OWN_ELEMENT_DAMAGE_BONUS_BY_REFINEMENT
      }
    }
  }
]
