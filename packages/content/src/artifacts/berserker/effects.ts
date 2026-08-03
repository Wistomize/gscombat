import type { CombatActionEffect } from "../../combat/types.js"

export const BERSERKER_TWO_PIECE_CRIT_RATE = 0.12
export const BERSERKER_LOW_HP_CRIT_RATE = 0.24

/** Typed automatic and low-health snapshot contributions of Berserker to maintained core actions. */
export const berserkerCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.berserker.2pc.crit-rate",
    label: "战狂 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "Berserker" },
    target: "critRate",
    value: { kind: "fixed", value: BERSERKER_TWO_PIECE_CRIT_RATE }
  },
  {
    activation: "active",
    id: "artifact.berserker.4pc.low-hp-crit-rate",
    label: "战狂 · 四件套（当前生命值低于70%）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "Berserker" },
    target: "critRate",
    value: { kind: "fixed", value: BERSERKER_LOW_HP_CRIT_RATE }
  }
]
