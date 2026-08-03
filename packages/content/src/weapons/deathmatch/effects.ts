import type { CombatActionEffect } from "../../combat/types.js"

const singleTargetAttackPercentByRefinement = [0.24, 0.3, 0.36, 0.42, 0.48] as const
const multiTargetAttackPercentByRefinement = [0.16, 0.2, 0.24, 0.28, 0.32] as const
const multiTargetDefensePercentByRefinement = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed automatic contributions of Deathmatch to any maintained action. */
export const deathmatchCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    condition: { kind: "enemy_count", maximum: 1 },
    id: "weapon.deathmatch.single-target.attack",
    label: "决斗之枪 · 至多一名敌人",
    source: { kind: "weapon", weaponId: "Deathmatch" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: singleTargetAttackPercentByRefinement }
  },
  {
    activation: "automatic",
    condition: { kind: "enemy_count", minimum: 2 },
    id: "weapon.deathmatch.multi-target.attack",
    label: "决斗之枪 · 至少两名敌人",
    source: { kind: "weapon", weaponId: "Deathmatch" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: multiTargetAttackPercentByRefinement }
  },
  {
    activation: "automatic",
    condition: { kind: "enemy_count", minimum: 2 },
    id: "weapon.deathmatch.multi-target.defense",
    label: "决斗之枪 · 至少两名敌人（防御力）",
    source: { kind: "weapon", weaponId: "Deathmatch" },
    target: "defensePercent",
    value: { kind: "refinement_table", values: multiTargetDefensePercentByRefinement }
  }
]

/** Returns Deathmatch's attack bonus for the current enemy count. */
export function getDeathmatchAttackPercent(refinement: number, enemyCount: number): number {
  const values = enemyCount < 2 ? singleTargetAttackPercentByRefinement : multiTargetAttackPercentByRefinement
  return values[Math.min(Math.max(refinement, 1), 5) - 1] ?? values[0]
}
