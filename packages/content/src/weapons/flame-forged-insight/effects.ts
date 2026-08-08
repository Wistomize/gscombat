import type { CombatActionEffect } from "../../combat/types.js"

export const FLAME_FORGED_INSIGHT_AFTER_LISTED_REACTION_ELEMENTAL_MASTERY = [60, 75, 90, 105, 120] as const

/** Typed selected post-reaction elemental-mastery contribution of Flame-Forged Insight. */
export const flameForgedInsightCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    selectionMode: "optional",
    id: "weapon.flame-forged-insight.after-listed-reaction.elemental-mastery",
    label: "拾慧铸熔 · 触发感电、月感电、绽放、月绽放、结晶或月结晶后15秒内",
    source: { kind: "weapon", weaponId: "FlameForgedInsight" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: FLAME_FORGED_INSIGHT_AFTER_LISTED_REACTION_ELEMENTAL_MASTERY }
  }
]
