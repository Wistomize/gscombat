import type { CombatActionEffect } from "../../combat/types.js"

export const WOLF_FANG_SKILL_BURST_DAMAGE_BONUS = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const WOLF_FANG_CRIT_RATE_PER_STACK = [0.02, 0.025, 0.03, 0.035, 0.04] as const

const stackCounts = [1, 2, 3, 4] as const
const talentSlots = ["skill", "burst"] as const
const talentLabels = { burst: "元素爆发", skill: "元素战技" } as const

function getCritRateValues(stackCount: number): readonly number[] {
  return WOLF_FANG_CRIT_RATE_PER_STACK.map((value) => value * stackCount)
}

function createCritRateStackEffect(
  talentSlot: (typeof talentSlots)[number],
  stackCount: (typeof stackCounts)[number]
): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: `wolf-fang-${talentSlot}-crit-rate`, variant: `${stackCount}-stack` },
    id: `weapon.wolf-fang.${talentSlot}-hit.${stackCount}-stack.crit-rate`,
    label: `狼牙 · 此前${talentLabels[talentSlot]}命中后${stackCount}层暴击率`,
    source: { kind: "weapon", weaponId: "WolfFang" },
    target: "critRate",
    targetFilter: { talentSlots: [talentSlot] },
    value: { kind: "refinement_table", values: getCritRateValues(stackCount) }
  }
}

/** Typed skill/burst damage and independently accumulated crit-rate contributions of Wolf-Fang. */
export const wolfFangCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.wolf-fang.skill-burst.damage-bonus",
    label: "狼牙 · 元素战技与元素爆发伤害",
    source: { kind: "weapon", weaponId: "WolfFang" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill", "burst"] },
    value: { kind: "refinement_table", values: WOLF_FANG_SKILL_BURST_DAMAGE_BONUS }
  },
  ...talentSlots.flatMap((talentSlot) => stackCounts.map((stackCount) => createCritRateStackEffect(talentSlot, stackCount)))
]
