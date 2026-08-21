import type { CombatActionEffect } from "../../combat/types.js"

export const BLADE_OF_ATONEMENT_ELEMENTAL_MASTERY = [64, 80, 96, 112, 128] as const
export const BLADE_OF_ATONEMENT_ATTACK_PERCENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed post-reaction contributions of Blade of Atonement. */
export const bladeOfAtonementCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.blade-of-atonement.after-reaction.elemental-mastery",
    label: "救赎之斩 · 触发元素反应后的元素精通（12秒内）",
    source: { kind: "weapon", weaponId: "BladeOfAtonement" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: BLADE_OF_ATONEMENT_ELEMENTAL_MASTERY }
  },
  {
    activation: "active",
    id: "weapon.blade-of-atonement.after-stellar-reaction.attack-percent",
    label: "救赎之斩 · 触发星烁反应后的攻击力（12秒内）",
    source: { kind: "weapon", weaponId: "BladeOfAtonement" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: BLADE_OF_ATONEMENT_ATTACK_PERCENT }
  }
]
