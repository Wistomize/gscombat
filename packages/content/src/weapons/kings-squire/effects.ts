import type { CombatActionEffect } from "../../combat/types.js"

export const KINGS_SQUIRE_AFTER_SKILL_OR_BURST_ELEMENTAL_MASTERY = [60, 80, 100, 120, 140] as const

/** Typed selected Leaf of the Forest elemental-mastery contribution of King's Squire. */
export const kingsSquireCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.kings-squire.after-skill-or-burst.elemental-mastery",
    label: "王下近侍 · 施放元素战技或元素爆发后12秒内",
    source: { kind: "weapon", weaponId: "KingsSquire" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: KINGS_SQUIRE_AFTER_SKILL_OR_BURST_ELEMENTAL_MASTERY }
  }
]
