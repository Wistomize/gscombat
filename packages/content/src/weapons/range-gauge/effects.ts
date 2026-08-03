import type { CombatActionEffect } from "../../combat/types.js"

export const RANGE_GAUGE_ATTACK_PERCENT_PER_CONSUMED_MARK = [0.03, 0.04, 0.05, 0.06, 0.07] as const
export const RANGE_GAUGE_ALL_ELEMENT_DAMAGE_BONUS_PER_CONSUMED_MARK = [0.07, 0.085, 0.1, 0.115, 0.13] as const

const consumedMarkCounts = [1, 2, 3] as const
const elementalDamageElements = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] as const

function getValues(values: readonly number[], consumedMarkCount: number): readonly number[] {
  return values.map((value) => value * consumedMarkCount)
}

function createConsumedMarkEffects(consumedMarkCount: (typeof consumedMarkCounts)[number]): readonly CombatActionEffect[] {
  const exclusivity = { group: "range-gauge-unity", variant: `${consumedMarkCount}-mark` }
  return [
    {
      activation: "active",
      exclusivity,
      id: `weapon.range-gauge.unity.${consumedMarkCount}-mark.attack-percent`,
      label: `测距规 · 消耗${consumedMarkCount}枚团结标记后的攻击力`,
      source: { kind: "weapon", weaponId: "RangeGauge" },
      target: "attackPercent",
      value: { kind: "refinement_table", values: getValues(RANGE_GAUGE_ATTACK_PERCENT_PER_CONSUMED_MARK, consumedMarkCount) }
    },
    {
      activation: "active",
      exclusivity,
      id: `weapon.range-gauge.unity.${consumedMarkCount}-mark.all-element-damage-bonus`,
      label: `测距规 · 消耗${consumedMarkCount}枚团结标记后的所有元素伤害`,
      source: { kind: "weapon", weaponId: "RangeGauge" },
      target: "damageBonus",
      targetFilter: { elements: elementalDamageElements },
      value: {
        kind: "refinement_table",
        values: getValues(RANGE_GAUGE_ALL_ELEMENT_DAMAGE_BONUS_PER_CONSUMED_MARK, consumedMarkCount)
      }
    }
  ]
}

/** Typed selected consumed-Unity-mark contributions of Range Gauge. */
export const rangeGaugeCombatActionEffects: readonly CombatActionEffect[] = consumedMarkCounts.flatMap(
  createConsumedMarkEffects
)
