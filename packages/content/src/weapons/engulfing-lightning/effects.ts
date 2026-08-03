import type { CombatActionEffect } from "../../combat/types.js"

const conversionByRefinement = [0.28, 0.35, 0.42, 0.49, 0.56] as const
const capByRefinement = [0.8, 0.9, 1, 1.1, 1.2] as const
const burstEnergyRechargeByRefinement = [0.3, 0.35, 0.4, 0.45, 0.5] as const

/** Typed contributions of Engulfing Lightning to the selected current-action snapshot. */
export const engulfingLightningCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.engulfing-lightning.energy-recharge-to-attack",
    label: "薙草之稻光 · 元素充能效率转攻击力",
    source: { kind: "weapon", weaponId: "EngulfingLightning" },
    target: "attackPercent",
    value: {
      kind: "source_stat",
      maximumValue: { kind: "refinement_table", values: capByRefinement },
      minimumValue: { kind: "fixed", value: 0 },
      multiplier: { kind: "refinement_table", values: conversionByRefinement },
      offset: -1,
      sourceStat: "energyRecharge"
    }
  },
  {
    activation: "active",
    deterministicSnapshotActivation: {
      requiredActionSnapshotCapabilities: ["after_primary_burst"]
    },
    id: "weapon.engulfing-lightning.post-burst-energy-recharge",
    label: "薙草之稻光 · 元素爆发后充能（当前动作前已生效）",
    source: { kind: "weapon", weaponId: "EngulfingLightning" },
    target: "energyRecharge",
    value: { kind: "refinement_table", values: burstEnergyRechargeByRefinement }
  }
]

function valueAtRefinement(values: readonly number[], refinement: number): number {
  return values[Math.min(Math.max(refinement, 1), 5) - 1] ?? values[0] ?? 0
}

/** Calculates Engulfing Lightning's attack-percent conversion at the selected refinement. */
export function getEngulfingAttackPercent(energyRecharge: number, refinement: number): number {
  const conversion = valueAtRefinement(conversionByRefinement, refinement)
  const cap = valueAtRefinement(capByRefinement, refinement)
  return Math.min(Math.max(energyRecharge - 1, 0) * conversion, cap)
}

/** Returns the post-burst energy recharge bonus at the selected refinement. */
export function getEngulfingBurstEnergyRecharge(refinement: number): number {
  return valueAtRefinement(burstEnergyRechargeByRefinement, refinement)
}
