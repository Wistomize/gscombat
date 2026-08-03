import type { CombatActionEffect } from "../../combat/types.js"

export const ALLEY_HUNTER_DAMAGE_BONUS_PER_STACK = [0.02, 0.025, 0.03, 0.035, 0.04] as const

const offFieldStackCounts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

function getOffFieldStackValues(values: readonly number[], stackCount: number): readonly number[] {
  return values.map((value) => Number((value * stackCount).toFixed(12)))
}

function createOffFieldStackEffect(stackCount: (typeof offFieldStackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "alley-hunter-off-field", variant: `${stackCount}-stack` },
    id: `weapon.alley-hunter.off-field.${stackCount}-stack.damage-bonus`,
    label: `暗巷猎手 · 当前核心动作前已持有${stackCount}层伤害提升（最多10层）`,
    source: { holder: "primary", kind: "weapon", weaponId: "AlleyHunter" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: getOffFieldStackValues(ALLEY_HUNTER_DAMAGE_BONUS_PER_STACK, stackCount) }
  }
}

/** Typed selected pre-existing off-field damage-bonus stacks of Alley Hunter. */
export const alleyHunterCombatActionEffects: readonly CombatActionEffect[] = offFieldStackCounts.map(createOffFieldStackEffect)
