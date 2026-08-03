import type { CombatActionEffect } from "../../combat/types.js"

export const HARBINGER_OF_DAWN_HP_ABOVE_90_CRIT_RATE = [0.14, 0.175, 0.21, 0.245, 0.28] as const

/** Typed selected high-health critical-rate contribution of Harbinger of Dawn. */
export const harbingerOfDawnCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.harbinger-of-dawn.hp-above-90.crit-rate",
    label: "黎明神剑 · 当前生命值高于90%时",
    source: { kind: "weapon", weaponId: "HarbingerOfDawn" },
    target: "critRate",
    value: { kind: "refinement_table", values: HARBINGER_OF_DAWN_HP_ABOVE_90_CRIT_RATE }
  }
]
