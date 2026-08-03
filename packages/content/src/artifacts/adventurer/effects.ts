import type { CombatActionEffect } from "../../combat/types.js"

export const ADVENTURER_TWO_PIECE_FLAT_HP = 1000

/** Typed automatic two-piece fixed-health contribution of Adventurer to one current action. */
export const adventurerCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.adventurer.2pc.flat-hp",
    label: "冒险家 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "Adventurer" },
    target: "hpFlat",
    value: { kind: "fixed", value: ADVENTURER_TWO_PIECE_FLAT_HP }
  }
]
