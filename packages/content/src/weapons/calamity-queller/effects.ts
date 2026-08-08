import type { CombatActionEffect } from "../../combat/types.js"

export const CALAMITY_QUELLER_ALL_ELEMENT_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const CALAMITY_QUELLER_CONSUMPTION_PER_STACK_ATTACK_PERCENT = [0.032, 0.04, 0.048, 0.056, 0.064] as const

const consumptionStackCounts = [1, 2, 3, 4, 5, 6] as const
const elementalDamageElements = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] as const

function getConsumptionAttackPercentValues(multiplier: number): readonly number[] {
  return CALAMITY_QUELLER_CONSUMPTION_PER_STACK_ATTACK_PERCENT.map((value) => value * multiplier)
}

function createConsumptionStackEffect(
  stackCount: (typeof consumptionStackCounts)[number],
  state: "on-field" | "off-field"
): CombatActionEffect {
  const multiplier = state === "on-field" ? stackCount : stackCount * 2
  const stateLabel = state === "on-field" ? "前台" : "后台"
  return {
    activation: "active",
    selectionMode: "optional",
    exclusivity: { group: "calamity-queller-consumption", variant: `${state}-${stackCount}-stack` },
    id: `weapon.calamity-queller.consumption.${state}.${stackCount}-stack.attack-percent`,
    label: `息灾 · 圆顿${stateLabel}${stackCount}层攻击力`,
    source: { kind: "weapon", weaponId: "CalamityQueller" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: getConsumptionAttackPercentValues(multiplier) }
  }
}

/** Typed self elemental-damage and selected Consumption stack contributions of Calamity Queller. */
export const calamityQuellerCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.calamity-queller.all-element-damage-bonus",
    label: "息灾 · 所有元素伤害",
    source: { kind: "weapon", weaponId: "CalamityQueller" },
    target: "damageBonus",
    targetFilter: { elements: elementalDamageElements },
    value: { kind: "refinement_table", values: CALAMITY_QUELLER_ALL_ELEMENT_DAMAGE_BONUS }
  },
  ...consumptionStackCounts.map((stackCount) => createConsumptionStackEffect(stackCount, "on-field")),
  ...consumptionStackCounts.map((stackCount) => createConsumptionStackEffect(stackCount, "off-field"))
]
