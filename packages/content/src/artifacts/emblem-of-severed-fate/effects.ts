import type { CombatActionEffect } from "../../combat/types.js"

export const EMBLEM_ENERGY_RECHARGE_BONUS = 0.2

/** Typed automatic contributions of Emblem of Severed Fate to any maintained action. */
export const emblemOfSeveredFateCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.emblem-of-severed-fate.2pc.energy-recharge",
    label: "绝缘之旗印 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "EmblemOfSeveredFate" },
    target: "energyRecharge",
    value: { kind: "fixed", value: EMBLEM_ENERGY_RECHARGE_BONUS }
  },
  {
    activation: "automatic",
    id: "artifact.emblem-of-severed-fate.4pc.burst-damage-bonus",
    label: "绝缘之旗印 · 四件套",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "EmblemOfSeveredFate" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["burst"] },
    value: {
      kind: "source_stat",
      maximumValue: { kind: "fixed", value: 0.75 },
      multiplier: { kind: "fixed", value: 0.25 },
      sourceStat: "energyRecharge"
    }
  }
]
