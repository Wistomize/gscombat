import type { CombatActionEffect } from "../../combat/types.js"

export const IRON_STING_DAMAGE_BONUS_PER_STACK = [0.06, 0.075, 0.09, 0.105, 0.12] as const

const stackCounts = [1, 2] as const

function getDamageBonusValues(stackCount: number): readonly number[] {
  return IRON_STING_DAMAGE_BONUS_PER_STACK.map((value) => value * stackCount)
}

function createStackEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "iron-sting-infusion-stinger", variant: `${stackCount}-stack` },
    id: `weapon.iron-sting.infusion-stinger.${stackCount}-stack.damage-bonus`,
    label: `铁蜂刺 · 造成元素伤害后的${stackCount}层全伤害`,
    source: { kind: "weapon", weaponId: "IronSting" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: getDamageBonusValues(stackCount) }
  }
}

/** Typed selected Infusion Stinger stack contributions of Iron Sting. */
export const ironStingCombatActionEffects: readonly CombatActionEffect[] = stackCounts.map(createStackEffect)
