import type { CombatActionEffect } from "../../combat/types.js"

export const THE_BELL_SHIELDED_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const

/** Typed selected shielded-state damage contribution of The Bell. */
export const theBellCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    selectionMode: "optional",
    id: "weapon.the-bell.shielded.damage-bonus",
    label: "钟剑 · 处于护盾庇护下的全伤害",
    source: { kind: "weapon", weaponId: "TheBell" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: THE_BELL_SHIELDED_DAMAGE_BONUS }
  }
]
