import type { CombatActionEffect } from "../../combat/types.js"

export const PORTABLE_POWER_SAW_ELEMENTAL_MASTERY_PER_CONSUMED_MARK = [40, 50, 60, 70, 80] as const

const consumedMarkCounts = [1, 2, 3] as const

function getElementalMasteryValues(consumedMarkCount: number): readonly number[] {
  return PORTABLE_POWER_SAW_ELEMENTAL_MASTERY_PER_CONSUMED_MARK.map((value) => value * consumedMarkCount)
}

function createConsumedMarkEffect(consumedMarkCount: (typeof consumedMarkCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "portable-power-saw-mariners-resolve", variant: `${consumedMarkCount}-mark` },
    id: `weapon.portable-power-saw.mariners-resolve.${consumedMarkCount}-mark.elemental-mastery`,
    label: `便携动力锯 · 消耗${consumedMarkCount}枚坚忍标记后的元素精通`,
    source: { kind: "weapon", weaponId: "PortablePowerSaw" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: getElementalMasteryValues(consumedMarkCount) }
  }
}

/** Typed selected consumed-Mariner's-Resolve elemental-mastery contributions of Portable Power Saw. */
export const portablePowerSawCombatActionEffects: readonly CombatActionEffect[] = consumedMarkCounts.map(
  createConsumedMarkEffect
)
