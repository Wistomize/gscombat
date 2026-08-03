import type { CombatActionEffect } from "../../combat/types.js"

export const STAFF_OF_THE_SCARLET_SANDS_BASE_ATTACK_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT = [
  0.52,
  0.65,
  0.78,
  0.91,
  1.04
] as const
export const STAFF_OF_THE_SCARLET_SANDS_STACK_ATTACK_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT = [
  0.28,
  0.35,
  0.42,
  0.49,
  0.56
] as const

function createRedSandsDreamStackEffect(stackCount: 1 | 2 | 3): CombatActionEffect {
  return {
    activation: "active",
    id: `weapon.staff-of-the-scarlet-sands.red-sands-dream.${stackCount}-stack.elemental-mastery-to-flat-attack`,
    label: `赤沙之杖 · 元素战技命中后的赤沙之梦 ${stackCount} 层`,
    source: { holder: "primary", kind: "weapon", weaponId: "StaffOfTheScarletSands" },
    target: "finalElementalMasteryToFlatAttack",
    value: {
      kind: "final_elemental_mastery",
      multiplier: {
        kind: "refinement_table",
        values: STAFF_OF_THE_SCARLET_SANDS_STACK_ATTACK_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT.map(
          (value) => value * stackCount
        )
      }
    }
  }
}

/** Typed automatic and selected current-action snapshots for Staff of the Scarlet Sands' Heat Haze at Horizon's End. */
export const staffOfTheScarletSandsCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.staff-of-the-scarlet-sands.elemental-mastery-to-flat-attack",
    label: "赤沙之杖 · 基于元素精通的额外攻击力",
    source: { holder: "primary", kind: "weapon", weaponId: "StaffOfTheScarletSands" },
    target: "finalElementalMasteryToFlatAttack",
    value: {
      kind: "final_elemental_mastery",
      multiplier: {
        kind: "refinement_table",
        values: STAFF_OF_THE_SCARLET_SANDS_BASE_ATTACK_FROM_ELEMENTAL_MASTERY_BY_REFINEMENT
      }
    }
  },
  createRedSandsDreamStackEffect(1),
  createRedSandsDreamStackEffect(2),
  createRedSandsDreamStackEffect(3)
]
