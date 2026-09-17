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
export const FLOWING_PURITY_BOND_OF_LIFE_MAX_HP_RATIO = 0.24

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
    selectionMode: "optional",
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

/** Full-clear default reuses the final-HP conversion stage; legacy partial-clear selections remain compatible. */
export const flowingPurityCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "maximum_reachable",
    weaponComparisonDefault: { recipientCharacterIds: "all" },
    id: "weapon.flowing-purity.after-skill.all-element-damage-bonus",
    label: "纯水流华 · 施放元素战技后的所有元素伤害",
    source: { kind: "weapon", weaponId: "FlowingPurity" },
    target: "damageBonus",
    targetFilter: { elements: elementalDamageElements },
    value: { kind: "refinement_table", values: FLOWING_PURITY_AFTER_SKILL_ALL_ELEMENT_DAMAGE_BONUS }
  },
  {
    activation: "maximum_reachable",
    weaponComparisonDefault: { recipientCharacterIds: "all" },
    exclusivity: { group: "flowing-purity-bond-of-life-cleared", variant: "full-clear" },
    id: "weapon.flowing-purity.bond-of-life-cleared.full-clear.all-element-damage-bonus",
    label: "纯水流华 · 默认治疗充分，24%生命之契完整清除后的元素增伤（15秒内）",
    source: { kind: "weapon", weaponId: "FlowingPurity" },
    target: "finalHpToDamageBonus",
    targetFilter: { elements: elementalDamageElements },
    value: {
      kind: "final_hp",
      multiplier: {
        kind: "refinement_table",
        values: FLOWING_PURITY_BOND_OF_LIFE_CLEAR_ALL_ELEMENT_DAMAGE_BONUS_PER_THOUSAND.map(
          (value) => value * FLOWING_PURITY_BOND_OF_LIFE_MAX_HP_RATIO / 1000
        )
      },
      maximumValue: { kind: "refinement_table", values: [0.12, 0.15, 0.18, 0.21, 0.24] }
    }
  },
  ...completeThousandPointClearCounts.map(createBondOfLifeClearDamageBonusEffect)
]
