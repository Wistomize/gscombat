import type { CombatActionEffect } from "../../combat/types.js"

export const THE_EXILE_ENERGY_RECHARGE_BONUS = 0.2

/** Typed two-piece contribution of The Exile to any maintained action. */
export const theExileCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.the-exile.2pc.energy-recharge",
    label: "流放者 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "TheExile" },
    target: "energyRecharge",
    value: { kind: "fixed", value: THE_EXILE_ENERGY_RECHARGE_BONUS }
  }
]
