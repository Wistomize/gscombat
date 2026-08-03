import type { CombatActionEffect } from "../../combat/types.js"

export const SKYRIDER_GREATSWORD_ATTACK_PERCENT_PER_STACK = [0.06, 0.07, 0.08, 0.09, 0.1] as const

const stackCounts = [1, 2, 3, 4] as const

function getAttackPercentValues(stackCount: number): readonly number[] {
  return SKYRIDER_GREATSWORD_ATTACK_PERCENT_PER_STACK.map((value) => value * stackCount)
}

function createStackEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "skyrider-greatsword-courage-stacks", variant: `${stackCount}-stack` },
    id: `weapon.skyrider-greatsword.courage.${stackCount}-stack.attack-percent`,
    label: `飞天大御剑 · 此前普攻或重击命中后的勇气${stackCount}层攻击力`,
    source: { kind: "weapon", weaponId: "SkyriderGreatsword" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: getAttackPercentValues(stackCount) }
  }
}

/** Typed selected current Courage-stack attack contribution of Skyrider Greatsword. */
export const skyriderGreatswordCombatActionEffects: readonly CombatActionEffect[] = stackCounts.map(createStackEffect)
