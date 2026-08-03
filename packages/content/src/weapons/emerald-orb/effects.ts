import type { CombatActionEffect } from "../../combat/types.js"

export const EMERALD_ORB_ATTACK_PERCENT_BY_REFINEMENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const

/** Typed selected post-Hydro-reaction contribution of Emerald Orb to a maintained core action. */
export const emeraldOrbCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.emerald-orb.after-hydro-reaction.attack-percent",
    label: "翡玉法球 · 触发指定水元素相关反应后",
    source: { kind: "weapon", weaponId: "EmeraldOrb" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: EMERALD_ORB_ATTACK_PERCENT_BY_REFINEMENT }
  }
]
