import type { CombatActionEffect } from "../../combat/types.js"

export const FROSTBREATH_ATTACK_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const

/** Typed post-Cryo-or-Hydro-reaction attack contribution of Frostbreath. */
export const frostbreathCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.frostbreath.after-cryo-or-hydro-reaction.attack-percent",
    label: "寒息 · 触发冰元素或水元素相关反应后的攻击力（15秒内）",
    source: { kind: "weapon", weaponId: "Frostbreath" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: FROSTBREATH_ATTACK_PERCENT }
  }
]
