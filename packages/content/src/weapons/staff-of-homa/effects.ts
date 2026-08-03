import type { CombatActionEffect } from "../../combat/types.js"

export const STAFF_OF_HOMA_HP_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const STAFF_OF_HOMA_FINAL_HP_TO_FLAT_ATTACK = [0.008, 0.01, 0.012, 0.014, 0.016] as const
export const STAFF_OF_HOMA_LOW_HP_FINAL_HP_TO_FLAT_ATTACK = [0.01, 0.012, 0.014, 0.016, 0.018] as const

/** Typed automatic health contribution of Staff of Homa. */
export const staffOfHomaCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.staff-of-homa.hp-percent",
    label: "护摩之杖 · 生命值",
    source: { holder: "primary", kind: "weapon", weaponId: "StaffOfHoma" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: STAFF_OF_HOMA_HP_PERCENT }
  },
  {
    activation: "automatic",
    id: "weapon.staff-of-homa.hp-sourced-flat-attack",
    label: "护摩之杖 · 生命值上限转固定攻击力",
    source: { holder: "primary", kind: "weapon", weaponId: "StaffOfHoma" },
    target: "finalHpToFlatAttack",
    value: { kind: "refinement_table", values: STAFF_OF_HOMA_FINAL_HP_TO_FLAT_ATTACK }
  },
  {
    activation: "active",
    id: "weapon.staff-of-homa.hp-below-50.extra-hp-sourced-flat-attack",
    label: "护摩之杖 · 当前生命值低于50%时的额外固定攻击力",
    source: { holder: "primary", kind: "weapon", weaponId: "StaffOfHoma" },
    target: "finalHpToFlatAttack",
    value: { kind: "refinement_table", values: STAFF_OF_HOMA_LOW_HP_FINAL_HP_TO_FLAT_ATTACK }
  }
]
