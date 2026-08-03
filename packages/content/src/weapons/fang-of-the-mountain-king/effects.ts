import type { CombatActionEffect } from "../../combat/types.js"

export const FANG_OF_THE_MOUNTAIN_KING_DAMAGE_BONUS_PER_STACK = [0.1, 0.125, 0.15, 0.175, 0.2] as const

const stackCounts = [1, 2, 3, 4, 5, 6] as const

function getDamageBonusValues(stackCount: number): readonly number[] {
  return FANG_OF_THE_MOUNTAIN_KING_DAMAGE_BONUS_PER_STACK.map((value) => value * stackCount)
}

function createStackEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "fang-of-the-mountain-king-verdant-ember", variant: `${stackCount}-stack` },
    id: `weapon.fang-of-the-mountain-king.verdant-ember.${stackCount}-stack.skill-burst-damage-bonus`,
    label: `山王长牙 · 本次动作前已有的${stackCount}层悬木祝赐伤害`,
    source: { kind: "weapon", weaponId: "FangOfTheMountainKing" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill", "burst"] },
    value: { kind: "refinement_table", values: getDamageBonusValues(stackCount) }
  }
}

/** Typed selected Verdant Ember stack contributions of Fang of the Mountain King. */
export const fangOfTheMountainKingCombatActionEffects: readonly CombatActionEffect[] = stackCounts.map(createStackEffect)
