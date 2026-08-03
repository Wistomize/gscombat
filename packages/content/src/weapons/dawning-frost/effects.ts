import type { CombatActionEffect } from "../../combat/types.js"

export const DAWNING_FROST_AFTER_CHARGED_HIT_ELEMENTAL_MASTERY = [72, 90, 108, 126, 144] as const
export const DAWNING_FROST_AFTER_SKILL_HIT_ELEMENTAL_MASTERY = [48, 60, 72, 84, 96] as const

/** Typed independent charged-hit and skill-hit elemental-mastery windows of Dawning Frost. */
export const dawningFrostCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.dawning-frost.after-charged-hit.elemental-mastery",
    label: "霜辰 · 重击命中后10秒内",
    source: { kind: "weapon", weaponId: "DawningFrost" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: DAWNING_FROST_AFTER_CHARGED_HIT_ELEMENTAL_MASTERY }
  },
  {
    activation: "active",
    id: "weapon.dawning-frost.after-skill-hit.elemental-mastery",
    label: "霜辰 · 元素战技命中后10秒内",
    source: { kind: "weapon", weaponId: "DawningFrost" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: DAWNING_FROST_AFTER_SKILL_HIT_ELEMENTAL_MASTERY }
  }
]
