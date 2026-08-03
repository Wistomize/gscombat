import type { CombatActionEffect } from "../../combat/types.js"

export const LIONS_ROAR_PYRO_OR_ELECTRO_AURA_DAMAGE_BONUS = [0.2, 0.24, 0.28, 0.32, 0.36] as const

/** Typed selected target-aura contribution of Lion's Roar to maintained core actions. */
export const lionsRoarCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.lions-roar.pyro-or-electro-aura.damage-bonus",
    label: "匣里龙吟 · 当前目标受火元素或雷元素影响",
    source: { kind: "weapon", weaponId: "LionsRoar" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: LIONS_ROAR_PYRO_OR_ELECTRO_AURA_DAMAGE_BONUS }
  }
]
