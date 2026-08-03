import type { CombatActionEffect } from "../../combat/types.js"

export const SURFS_UP_HP_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const SURFS_UP_NORMAL_DAMAGE_BONUS_PER_STACK = [0.12, 0.15, 0.18, 0.21, 0.24] as const

const stackCounts = [1, 2, 3, 4] as const

function getDamageBonusValues(stackCount: number): readonly number[] {
  return SURFS_UP_NORMAL_DAMAGE_BONUS_PER_STACK.map((value) => value * stackCount)
}

function createStackEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "surfs-up-scorching-summer", variant: `${stackCount}-stack` },
    id: `weapon.surfs-up.scorching-summer.${stackCount}-stack.normal-damage-bonus`,
    label: `冲浪时光 · ${stackCount}层炽夏普通攻击伤害`,
    source: { kind: "weapon", weaponId: "SurfsUp" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal"] },
    value: { kind: "refinement_table", values: getDamageBonusValues(stackCount) }
  }
}

/** Typed automatic health and selected Scorching Summer contributions of Surf's Up. */
export const surfsUpCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.surfs-up.hp-percent",
    label: "冲浪时光 · 生命值",
    source: { kind: "weapon", weaponId: "SurfsUp" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: SURFS_UP_HP_PERCENT }
  },
  ...stackCounts.map(createStackEffect)
]
