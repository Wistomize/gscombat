import type { CombatActionEffect } from "../../combat/types.js"

export const LUCKY_DOG_TWO_PIECE_FLAT_DEFENSE = 100

/** Typed automatic two-piece fixed-defense contribution of Lucky Dog to one current action. */
export const luckyDogCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.lucky-dog.2pc.flat-defense",
    label: "幸运儿 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "LuckyDog" },
    target: "defenseFlat",
    value: { kind: "fixed", value: LUCKY_DOG_TWO_PIECE_FLAT_DEFENSE }
  }
]
