import type { CombatActionEffect } from "../../combat/types.js"

export const COOL_STEEL_HYDRO_OR_CRYO_AURA_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const

/** Typed selected Hydro-or-Cryo-aura target damage contribution of Cool Steel. */
export const coolSteelCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.cool-steel.hydro-or-cryo-aura.damage-bonus",
    label: "冷刃 · 当前目标受水元素或冰元素影响时的伤害",
    source: { kind: "weapon", weaponId: "CoolSteel" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: COOL_STEEL_HYDRO_OR_CRYO_AURA_DAMAGE_BONUS }
  }
]
