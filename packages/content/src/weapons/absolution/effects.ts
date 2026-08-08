import type { CombatActionEffect } from "../../combat/types.js"

export const ABSOLUTION_CRIT_DAMAGE = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const ABSOLUTION_BOND_OF_LIFE_INCREASE_DAMAGE_BONUS_PER_STACK = [0.16, 0.2, 0.24, 0.28, 0.32] as const

const stackCounts = [1, 2, 3] as const

function getDamageBonusValues(stackCount: number): readonly number[] {
  return ABSOLUTION_BOND_OF_LIFE_INCREASE_DAMAGE_BONUS_PER_STACK.map((value) =>
    Number((value * stackCount).toFixed(12))
  )
}

function createBondOfLifeIncreaseEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    selectionMode: "optional",
    exclusivity: { group: "absolution-bond-of-life-increase", variant: `${stackCount}-stack` },
    id: `weapon.absolution.bond-of-life-increase.${stackCount}-stack.damage-bonus`,
    label: `赦罪 · 本次命中前已持有的${stackCount}层生命之契数值增加伤害提升（6秒内）`,
    source: { holder: "primary", kind: "weapon", weaponId: "Absolution" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: getDamageBonusValues(stackCount) }
  }
}

/** Typed self critical-damage and selected Bond-of-Life increase contributions of Absolution. */
export const absolutionCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.absolution.crit-damage",
    label: "赦罪 · 暴击伤害",
    source: { holder: "primary", kind: "weapon", weaponId: "Absolution" },
    target: "critDamage",
    value: { kind: "refinement_table", values: ABSOLUTION_CRIT_DAMAGE }
  },
  ...stackCounts.map(createBondOfLifeIncreaseEffect)
]
