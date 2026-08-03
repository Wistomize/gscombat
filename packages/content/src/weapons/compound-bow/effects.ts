import type { CombatActionEffect } from "../../combat/types.js"

export const COMPOUND_BOW_ATTACK_PERCENT_PER_STACK = [0.04, 0.05, 0.06, 0.07, 0.08] as const

const stackCounts = [1, 2, 3, 4] as const

function getAttackPercentValues(stackCount: number): readonly number[] {
  return COMPOUND_BOW_ATTACK_PERCENT_PER_STACK.map((value) => value * stackCount)
}

function createStackEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "compound-bow-normal-or-charged-hit", variant: `${stackCount}-stack` },
    id: `weapon.compound-bow.normal-or-charged-hit.${stackCount}-stack.attack-percent`,
    label: `钢轮弓 · 普通攻击或重击命中后的${stackCount}层攻击力`,
    source: { kind: "weapon", weaponId: "CompoundBow" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: getAttackPercentValues(stackCount) }
  }
}

/** Typed selected normal-or-charged-hit stacks of Compound Bow. */
export const compoundBowCombatActionEffects: readonly CombatActionEffect[] = stackCounts.map(createStackEffect)
