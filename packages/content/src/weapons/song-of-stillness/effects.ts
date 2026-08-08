import type { CombatActionEffect } from "../../combat/types.js"

export const SONG_OF_STILLNESS_AFTER_HEAL_DAMAGE_BONUS = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed selected post-healing contribution of Song of Stillness to maintained core actions. */
export const songOfStillnessCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    selectionMode: "optional",
    id: "weapon.song-of-stillness.after-heal.damage-bonus",
    label: "静谧之曲 · 受到治疗后8秒内",
    source: { kind: "weapon", weaponId: "SongOfStillness" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: SONG_OF_STILLNESS_AFTER_HEAL_DAMAGE_BONUS }
  }
]
