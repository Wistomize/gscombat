import type { CombatActionEffect } from "../../combat/types.js"

export const AUBADE_OF_MORNINGSTAR_AND_MOON_TWO_PIECE_ELEMENTAL_MASTERY = 80

/** Typed automatic two-piece contribution of Aubade of Morningstar and Moon to one current action. */
export const aubadeOfMorningstarAndMoonCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.aubade-of-morningstar-and-moon.2pc.elemental-mastery",
    label: "晨星与月的晓歌 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "AubadeOfMorningstarAndMoon" },
    target: "elementalMastery",
    value: { kind: "fixed", value: AUBADE_OF_MORNINGSTAR_AND_MOON_TWO_PIECE_ELEMENTAL_MASTERY }
  }
]
