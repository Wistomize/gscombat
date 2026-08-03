import type { CombatActionEffect } from "../../combat/types.js"

export const DEFENDERS_WILL_TWO_PIECE_DEFENSE_PERCENT = 0.3

/** Typed automatic two-piece contribution of Defender's Will to one current action. */
export const defendersWillCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.defenders-will.2pc.defense-percent",
    label: "守护之心 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "DefendersWill" },
    target: "defensePercent",
    value: { kind: "fixed", value: DEFENDERS_WILL_TWO_PIECE_DEFENSE_PERCENT }
  }
]
