import type { CombatActionEffect } from "../../combat/types.js"

export const WINE_AND_SONG_AFTER_SPRINT_ATTACK_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const

/** Typed selected post-sprint contribution of Wine and Song to maintained core actions. */
export const wineAndSongCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.wine-and-song.after-sprint.attack-percent",
    label: "暗巷的酒与诗 · 使用冲刺或替代冲刺后5秒内",
    source: { kind: "weapon", weaponId: "WineAndSong" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: WINE_AND_SONG_AFTER_SPRINT_ATTACK_PERCENT }
  }
]
