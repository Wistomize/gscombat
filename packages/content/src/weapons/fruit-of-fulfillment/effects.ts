import type { CombatActionEffect } from "../../combat/types.js"

export const FRUIT_OF_FULFILLMENT_ELEMENTAL_MASTERY_PER_STACK = [24, 27, 30, 33, 36] as const
export const FRUIT_OF_FULFILLMENT_ATTACK_PERCENT_PER_STACK = -0.05

const stackCounts = [1, 2, 3, 4, 5] as const

function getElementalMasteryValues(stackCount: number): readonly number[] {
  return FRUIT_OF_FULFILLMENT_ELEMENTAL_MASTERY_PER_STACK.map((value) => value * stackCount)
}

function createStackEffects(stackCount: (typeof stackCounts)[number]): readonly CombatActionEffect[] {
  const exclusivity = { group: "fruit-of-fulfillment-wax-and-wane", variant: `${stackCount}-stack` }
  return [
    {
      activation: "active",
      exclusivity,
      id: `weapon.fruit-of-fulfillment.wax-and-wane.${stackCount}-stack.elemental-mastery`,
      label: `盈满之实 · ${stackCount}层盈亏元素精通`,
      source: { kind: "weapon", weaponId: "FruitOfFulfillment" },
      target: "elementalMastery",
      value: { kind: "refinement_table", values: getElementalMasteryValues(stackCount) }
    },
    {
      activation: "active",
      exclusivity,
      id: `weapon.fruit-of-fulfillment.wax-and-wane.${stackCount}-stack.attack-percent`,
      label: `盈满之实 · ${stackCount}层盈亏攻击力`,
      source: { kind: "weapon", weaponId: "FruitOfFulfillment" },
      target: "attackPercent",
      value: { kind: "fixed", value: FRUIT_OF_FULFILLMENT_ATTACK_PERCENT_PER_STACK * stackCount }
    }
  ]
}

/** Typed selected Wax and Wane stack contributions of Fruit of Fulfillment. */
export const fruitOfFulfillmentCombatActionEffects: readonly CombatActionEffect[] = stackCounts.flatMap(createStackEffects)
