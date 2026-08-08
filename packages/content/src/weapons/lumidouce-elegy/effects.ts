import type { CombatActionEffect } from "../../combat/types.js"

export const LUMIDOUCE_ELEGY_ATTACK_PERCENT = [0.15, 0.19, 0.23, 0.27, 0.31] as const
export const LUMIDOUCE_ELEGY_DAMAGE_BONUS_PER_STACK = [0.18, 0.23, 0.28, 0.33, 0.38] as const

const stackCounts = [1, 2] as const

function getDamageBonusValues(stackCount: number): readonly number[] {
  return LUMIDOUCE_ELEGY_DAMAGE_BONUS_PER_STACK.map((value) => value * stackCount)
}

function createStackEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    selectionMode: "optional",
    exclusivity: { group: "lumidouce-elegy-burning", variant: `${stackCount}-stack` },
    id: `weapon.lumidouce-elegy.burning.${stackCount}-stack.damage-bonus`,
    label: `柔灯挽歌 · 燃烧触发后的${stackCount}层全伤害`,
    source: { kind: "weapon", weaponId: "LumidouceElegy" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: getDamageBonusValues(stackCount) }
  }
}

/** Typed automatic attack and selected burning-state contributions of Lumidouce Elegy. */
export const lumidouceElegyCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.lumidouce-elegy.attack-percent",
    label: "柔灯挽歌 · 攻击力",
    source: { kind: "weapon", weaponId: "LumidouceElegy" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: LUMIDOUCE_ELEGY_ATTACK_PERCENT }
  },
  ...stackCounts.map(createStackEffect)
]
