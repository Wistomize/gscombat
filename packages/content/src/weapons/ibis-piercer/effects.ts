import type { CombatActionEffect } from "../../combat/types.js"

export const IBIS_PIERCER_ELEMENTAL_MASTERY_PER_STACK = [40, 50, 60, 70, 80] as const

const stackCounts = [1, 2] as const

function getElementalMasteryValues(stackCount: number): readonly number[] {
  return IBIS_PIERCER_ELEMENTAL_MASTERY_PER_STACK.map((value) => value * stackCount)
}

function createStackEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "ibis-piercer-precision", variant: `${stackCount}-stack` },
    id: `weapon.ibis-piercer.precision.${stackCount}-stack.elemental-mastery`,
    label: `鹮穿之喙 · 重击命中后的${stackCount}层元素精通`,
    source: { kind: "weapon", weaponId: "IbisPiercer" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: getElementalMasteryValues(stackCount) }
  }
}

/** Typed selected post-charged-hit Precision stack contributions of Ibis Piercer. */
export const ibisPiercerCombatActionEffects: readonly CombatActionEffect[] = stackCounts.map(createStackEffect)
