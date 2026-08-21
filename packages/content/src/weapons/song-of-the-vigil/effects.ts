import type { CombatActionEffect } from "../../combat/types.js"

export const SONG_OF_THE_VIGIL_ATTACK_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const

/** Typed post-Stellar-reaction attack contribution of Song of the Vigil. */
export const songOfTheVigilCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.song-of-the-vigil.after-stellar-reaction.attack-percent",
    label: "戍望谣歌 · 触发星烁反应后的攻击力（12秒内）",
    source: { kind: "weapon", weaponId: "SongOfTheVigil" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: SONG_OF_THE_VIGIL_ATTACK_PERCENT }
  }
]
