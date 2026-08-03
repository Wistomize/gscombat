import type { CombatActionEffect } from "../../combat/types.js"

export const RING_OF_YAXCHE_FINAL_HP_TO_NORMAL_DAMAGE_BONUS_BY_REFINEMENT = [
  0.000006,
  0.000007,
  0.000008,
  0.000009,
  0.00001
] as const
export const RING_OF_YAXCHE_NORMAL_DAMAGE_BONUS_MAXIMUM_BY_REFINEMENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed selected current-action snapshot for Ring of Yaxche's Jade Crown effect. */
export const ringOfYaxcheCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.ring-of-yaxche.after-skill.final-hp-to-normal-damage-bonus",
    label: "木棉之环 · 施放元素战技后10秒内的普通攻击伤害",
    source: { holder: "primary", kind: "weapon", weaponId: "RingOfYaxche" },
    target: "finalHpToDamageBonus",
    targetFilter: { attackKinds: ["normal"] },
    value: {
      kind: "final_hp",
      maximumValue: {
        kind: "refinement_table",
        values: RING_OF_YAXCHE_NORMAL_DAMAGE_BONUS_MAXIMUM_BY_REFINEMENT
      },
      multiplier: {
        kind: "refinement_table",
        values: RING_OF_YAXCHE_FINAL_HP_TO_NORMAL_DAMAGE_BONUS_BY_REFINEMENT
      }
    }
  }
]
