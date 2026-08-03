import type { CombatActionEffect } from "../../combat/types.js"

export const MARTIAL_ARTIST_TWO_PIECE_NORMAL_CHARGED_DAMAGE_BONUS = 0.15
export const MARTIAL_ARTIST_FOUR_PIECE_NORMAL_CHARGED_DAMAGE_BONUS = 0.25

/** Typed two-piece and selected post-skill four-piece contributions of Martial Artist. */
export const martialArtistCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.martial-artist.2pc.normal-charged-damage-bonus",
    label: "武人 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "MartialArtist" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "fixed", value: MARTIAL_ARTIST_TWO_PIECE_NORMAL_CHARGED_DAMAGE_BONUS }
  },
  {
    activation: "active",
    id: "artifact.martial-artist.4pc.after-skill.normal-charged-damage-bonus",
    label: "武人 · 四件套（元素战技后8秒内）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "MartialArtist" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "fixed", value: MARTIAL_ARTIST_FOUR_PIECE_NORMAL_CHARGED_DAMAGE_BONUS }
  }
]
