import type { CombatActionEffect } from "../../combat/types.js"

export const SCHOLAR_ENERGY_RECHARGE_BONUS = 0.2

/** Typed two-piece contribution of Scholar to any maintained action. */
export const scholarCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.scholar.2pc.energy-recharge",
    label: "学士 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "Scholar" },
    target: "energyRecharge",
    value: { kind: "fixed", value: SCHOLAR_ENERGY_RECHARGE_BONUS }
  }
]
