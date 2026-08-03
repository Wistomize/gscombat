import type { CombatActionEffect } from "../../combat/types.js"

export const WAVERIDING_WHIRL_BASE_HP_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const WAVERIDING_WHIRL_HP_PERCENT_PER_HYDRO_CHARACTER = [0.12, 0.15, 0.18, 0.21, 0.24] as const

const hydroCharacterCounts = [0, 1, 2] as const

function getHpPercentValues(hydroCharacterCount: number): readonly number[] {
  return WAVERIDING_WHIRL_BASE_HP_PERCENT.map((baseValue, refinementIndex) => {
    const perHydroCharacterValue = WAVERIDING_WHIRL_HP_PERCENT_PER_HYDRO_CHARACTER[refinementIndex]
    if (perHydroCharacterValue === undefined) throw new Error("Waveriding Whirl Hydro-count values are unavailable")
    return baseValue + perHydroCharacterValue * hydroCharacterCount
  })
}

function createHydroCharacterCountEffect(
  hydroCharacterCount: (typeof hydroCharacterCounts)[number]
): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: {
      group: "waveriding-whirl-hydro-character-count",
      variant: hydroCharacterCount + "-hydro-character"
    },
    id: "weapon.waveriding-whirl.hydro-character-count." + hydroCharacterCount + ".hp-percent",
    label: "乘浪的回旋 · 队伍中" + hydroCharacterCount + "名水元素角色时的生命值",
    source: { kind: "weapon", weaponId: "WaveridingWhirl" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: getHpPercentValues(hydroCharacterCount) }
  }
}

/** Typed selected Hydro-character-count contribution of Waveriding Whirl. */
export const waveridingWhirlCombatActionEffects: readonly CombatActionEffect[] = hydroCharacterCounts.map(
  createHydroCharacterCountEffect
)
