import type { CombatActionEffect } from "../../combat/types.js"

export const ALLEY_HUNTER_DAMAGE_BONUS_PER_STACK = [0.02, 0.025, 0.03, 0.035, 0.04] as const

const offFieldStackCounts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

function getOffFieldStackValues(values: readonly number[], stackCount: number): readonly number[] {
  return values.map((value) => Number((value * stackCount).toFixed(12)))
}

function createOffFieldStackEffect(stackCount: (typeof offFieldStackCounts)[number]): CombatActionEffect {
  return {
    activation: "automatic",
    lifecycle: stackCount === 10 ? { kind: "conditional", preparation: "qualified", retention: "while_applicable",
      trigger: { event: "none", sourceFieldPresence: "any" }, applicability: { sourceFieldPresence: "off_field" },
      explanation: "后台默认十层；前台不计，不模拟切入宽限时间" }
      : { kind: "excluded", reason: "后台自动十层，旧层数不再手选" },
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
