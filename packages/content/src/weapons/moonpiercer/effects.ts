import type { CombatActionEffect } from "../../combat/types.js"

export const MOONPIERCER_LEAF_ATTACK_PERCENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed selected Verdant Leaf pickup contribution of Moonpiercer. */
export const moonpiercerCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.moonpiercer.after-dendro-reaction.leaf-picked.attack-percent",
    label: "贯月矢 · 拾取苏生之叶后12秒内",
    source: { kind: "weapon", weaponId: "Moonpiercer" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: MOONPIERCER_LEAF_ATTACK_PERCENT }
  }
]
