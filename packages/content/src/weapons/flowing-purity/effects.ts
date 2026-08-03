import type { CombatActionEffect } from "../../combat/types.js"

export const FLOWING_PURITY_AFTER_SKILL_ALL_ELEMENT_DAMAGE_BONUS = [0.08, 0.1, 0.12, 0.14, 0.16] as const
export const FLOWING_PURITY_BOND_OF_LIFE_CLEAR_ALL_ELEMENT_DAMAGE_BONUS_PER_THOUSAND = [
  0.02,
  0.025,
  0.03,
  0.035,
  0.04
] as const

const elementalDamageElements = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] as const
const completeThousandPointClearCounts = [1, 2, 3, 4, 5, 6] as const

function getBondOfLifeClearDamageBonusValues(completeThousandPointClearCount: number): readonly number[] {
  return FLOWING_PURITY_BOND_OF_LIFE_CLEAR_ALL_ELEMENT_DAMAGE_BONUS_PER_THOUSAND.map(
    (value) => Number((value * completeThousandPointClearCount).toFixed(12))
  )
}

function createBondOfLifeClearDamageBonusEffect(
  completeThousandPointClearCount: (typeof completeThousandPointClearCounts)[number]
): CombatActionEffect {
  const clearedBondOfLife = completeThousandPointClearCount * 1000
  return {
    activation: "active",
    exclusivity: {
      group: "flowing-purity-bond-of-life-cleared",
      variant: `${completeThousandPointClearCount}-thousand-points`
    },
    id: `weapon.flowing-purity.bond-of-life-cleared.${completeThousandPointClearCount}-thousand-points.all-element-damage-bonus`,
    label: `纯水流华 · 清除生命之契后已获得${completeThousandPointClearCount}个完整千点（${clearedBondOfLife}点）的额外所有元素伤害`,
    source: { kind: "weapon", weaponId: "FlowingPurity" },
    target: "damageBonus",
    targetFilter: { elements: elementalDamageElements },
    value: { kind: "refinement_table", values: getBondOfLifeClearDamageBonusValues(completeThousandPointClearCount) }
  }
}

/** Typed post-skill and explicit Bond-of-Life-clear elemental-damage snapshots of Flowing Purity. */
export const flowingPurityCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.flowing-purity.after-skill.all-element-damage-bonus",
    label: "纯水流华 · 施放元素战技后的所有元素伤害",
    source: { kind: "weapon", weaponId: "FlowingPurity" },
    target: "damageBonus",
    targetFilter: { elements: elementalDamageElements },
    value: { kind: "refinement_table", values: FLOWING_PURITY_AFTER_SKILL_ALL_ELEMENT_DAMAGE_BONUS }
  },
  ...completeThousandPointClearCounts.map(createBondOfLifeClearDamageBonusEffect)
]
