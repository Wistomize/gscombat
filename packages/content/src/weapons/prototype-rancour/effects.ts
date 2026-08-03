import type { CombatActionEffect } from "../../combat/types.js"

export const PROTOTYPE_RANCOUR_ATTACK_DEFENSE_PERCENT_PER_STACK = [0.04, 0.05, 0.06, 0.07, 0.08] as const

const stackCounts = [1, 2, 3, 4] as const

function getValues(stackCount: number): readonly number[] {
  return PROTOTYPE_RANCOUR_ATTACK_DEFENSE_PERCENT_PER_STACK.map((value) => value * stackCount)
}

function createStackEffects(stackCount: (typeof stackCounts)[number]): readonly CombatActionEffect[] {
  const exclusivity = { group: "prototype-rancour-shattered-stone", variant: `${stackCount}-stack` }
  return [
    {
      activation: "active",
      exclusivity,
      id: `weapon.prototype-rancour.shattered-stone.${stackCount}-stack.attack-percent`,
      label: `试作斩岩 · 普通攻击或重击命中后的${stackCount}层攻击力`,
      source: { kind: "weapon", weaponId: "PrototypeRancour" },
      target: "attackPercent",
      value: { kind: "refinement_table", values: getValues(stackCount) }
    },
    {
      activation: "active",
      exclusivity,
      id: `weapon.prototype-rancour.shattered-stone.${stackCount}-stack.defense-percent`,
      label: `试作斩岩 · 普通攻击或重击命中后的${stackCount}层防御力`,
      source: { kind: "weapon", weaponId: "PrototypeRancour" },
      target: "defensePercent",
      value: { kind: "refinement_table", values: getValues(stackCount) }
    }
  ]
}

/** Typed selected Shattered Stone stack contributions of Prototype Rancour. */
export const prototypeRancourCombatActionEffects: readonly CombatActionEffect[] = stackCounts.flatMap(createStackEffects)
