import type { CombatActionEffect } from "../../combat/types.js"

export const SACRIFICIAL_JADE_OFF_FIELD_HP_PERCENT = [0.32, 0.4, 0.48, 0.56, 0.64] as const
export const SACRIFICIAL_JADE_OFF_FIELD_ELEMENTAL_MASTERY = [40, 50, 60, 70, 80] as const

/** Typed selected post-off-field return contribution of Sacrificial Jade. */
export const sacrificialJadeCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.sacrificial-jade.after-off-field.hp-percent",
    label: "遗祀玉珑 · 后台超过5秒后登场的生命值",
    source: { kind: "weapon", weaponId: "SacrificialJade" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: SACRIFICIAL_JADE_OFF_FIELD_HP_PERCENT }
  },
  {
    activation: "active",
    id: "weapon.sacrificial-jade.after-off-field.elemental-mastery",
    label: "遗祀玉珑 · 后台超过5秒后登场的元素精通",
    source: { kind: "weapon", weaponId: "SacrificialJade" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: SACRIFICIAL_JADE_OFF_FIELD_ELEMENTAL_MASTERY }
  }
]
