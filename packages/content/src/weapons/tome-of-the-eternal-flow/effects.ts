import type { CombatActionEffect } from "../../combat/types.js"

export const TOME_OF_THE_ETERNAL_FLOW_HP_PERCENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const TOME_OF_THE_ETERNAL_FLOW_CHARGED_DAMAGE_BONUS_PER_STACK = [
  0.14, 0.18, 0.22, 0.26, 0.3
] as const

const chargedDamageStackCounts = [1, 2, 3] as const

function getChargedDamageBonusValues(stackCount: number): readonly number[] {
  return TOME_OF_THE_ETERNAL_FLOW_CHARGED_DAMAGE_BONUS_PER_STACK.map((value) => value * stackCount)
}

function createChargedDamageStackEffect(
  stackCount: (typeof chargedDamageStackCounts)[number]
): CombatActionEffect {
  return {
    activation: "active",
    selectionMode: "optional",
    exclusivity: { group: "tome-of-the-eternal-flow-raging-tides", variant: stackCount + "-stack" },
    id: "weapon.tome-of-the-eternal-flow.raging-tides." + stackCount + "-stack.charged-damage-bonus",
    label: "万世流涌大典 · 荡尽" + stackCount + "层重击伤害",
    source: { kind: "weapon", weaponId: "TomeOfTheEternalFlow" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["charged"] },
    value: { kind: "refinement_table", values: getChargedDamageBonusValues(stackCount) }
  }
}

/** Typed self HP and selected Raging Tides contributions of Tome of the Eternal Flow. */
export const tomeOfTheEternalFlowCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.tome-of-the-eternal-flow.hp-percent",
    label: "万世流涌大典 · 生命值",
    source: { kind: "weapon", weaponId: "TomeOfTheEternalFlow" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: TOME_OF_THE_ETERNAL_FLOW_HP_PERCENT }
  },
  ...chargedDamageStackCounts.map(createChargedDamageStackEffect)
]
