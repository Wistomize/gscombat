import type { CombatActionEffect } from "../../combat/types.js"

export const AQUA_SIMULACRA_DAMAGE_BONUS_BY_REFINEMENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const AQUA_SIMULACRA_HP_PERCENT_BY_REFINEMENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed contributions of Aqua Simulacra to the selected current-action snapshot. */
export const aquaSimulacraCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.aqua-simulacra.hp-percent",
    label: "若水 · 生命值",
    source: { kind: "weapon", weaponId: "AquaSimulacra" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: AQUA_SIMULACRA_HP_PERCENT_BY_REFINEMENT }
  },
  {
    activation: "active",
    id: "weapon.aqua-simulacra.nearby-enemy-damage-bonus",
    label: "若水 · 附近存在敌人（当前动作前已生效）",
    source: { kind: "weapon", weaponId: "AquaSimulacra" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: AQUA_SIMULACRA_DAMAGE_BONUS_BY_REFINEMENT }
  }
]
