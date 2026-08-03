import type { CombatActionEffect } from "../../combat/types.js"

export const SUNNY_MORNING_SLEEP_IN_AFTER_SWIRL_ELEMENTAL_MASTERY = [120, 150, 180, 210, 240] as const
export const SUNNY_MORNING_SLEEP_IN_AFTER_SKILL_HIT_ELEMENTAL_MASTERY = [96, 120, 144, 168, 192] as const
export const SUNNY_MORNING_SLEEP_IN_AFTER_BURST_HIT_ELEMENTAL_MASTERY = [32, 40, 48, 56, 64] as const

/** Typed independent Swirl, skill-hit, and burst-hit elemental-mastery windows of Sunny Morning Sleep-In. */
export const sunnyMorningSleepInCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.sunny-morning-sleep-in.after-swirl.elemental-mastery",
    label: "寝正月初晴 · 触发扩散反应后6秒内",
    source: { kind: "weapon", weaponId: "SunnyMorningSleepIn" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: SUNNY_MORNING_SLEEP_IN_AFTER_SWIRL_ELEMENTAL_MASTERY }
  },
  {
    activation: "active",
    id: "weapon.sunny-morning-sleep-in.after-skill-hit.elemental-mastery",
    label: "寝正月初晴 · 元素战技命中后9秒内",
    source: { kind: "weapon", weaponId: "SunnyMorningSleepIn" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: SUNNY_MORNING_SLEEP_IN_AFTER_SKILL_HIT_ELEMENTAL_MASTERY }
  },
  {
    activation: "active",
    id: "weapon.sunny-morning-sleep-in.after-burst-hit.elemental-mastery",
    label: "寝正月初晴 · 元素爆发命中后30秒内",
    source: { kind: "weapon", weaponId: "SunnyMorningSleepIn" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: SUNNY_MORNING_SLEEP_IN_AFTER_BURST_HIT_ELEMENTAL_MASTERY }
  }
]
