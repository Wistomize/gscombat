import type { CombatActionEffect } from "../../combat/types.js"

export const BLOODTAINTED_GREATSWORD_PYRO_OR_ELECTRO_AURA_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const

/** Typed selected Pyro-or-Electro-aura target damage contribution of Bloodtainted Greatsword. */
export const bloodtaintedGreatswordCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.bloodtainted-greatsword.pyro-or-electro-aura.damage-bonus",
    label: "沐浴龙血的剑 · 当前目标受火元素或雷元素影响时的伤害",
    source: { kind: "weapon", weaponId: "BloodtaintedGreatsword" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: BLOODTAINTED_GREATSWORD_PYRO_OR_ELECTRO_AURA_DAMAGE_BONUS }
  }
]
