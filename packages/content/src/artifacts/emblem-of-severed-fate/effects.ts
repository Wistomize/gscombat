import type { DamageBonusModifier, Modifier } from "@gscombat/calculator"
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

/** Returns the four-piece burst bonus from current energy recharge. */
export function createEmblemBurstModifier(energyRecharge: number, pieceCount: number): DamageBonusModifier | undefined {
  if (pieceCount < 4) return undefined
  return {
    filter: { talent: "burst" },
    kind: "damage_bonus",
    source: "artifact.emblem.4pc",
    value: Math.min(energyRecharge * 0.25, 0.75)
  }
}

export const illustrativeEmblemBurstModifier: Modifier = {
  filter: { talent: "burst" },
  kind: "damage_bonus",
  source: "emblem_of_severed_fate.four_piece_illustrative",
  value: 0.65
}
