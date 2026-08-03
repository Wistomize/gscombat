import type { CombatActionEffect } from "../../combat/types.js"

export const FOOTPRINT_OF_THE_RAINBOW_AFTER_SKILL_DEFENSE_PERCENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed selected post-skill defense contribution of Footprint of the Rainbow. */
export const footprintOfTheRainbowCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.footprint-of-the-rainbow.after-skill.defense-percent",
    label: "虹的行迹 · 施放元素战技后15秒内",
    source: { kind: "weapon", weaponId: "FootprintOfTheRainbow" },
    target: "defensePercent",
    value: { kind: "refinement_table", values: FOOTPRINT_OF_THE_RAINBOW_AFTER_SKILL_DEFENSE_PERCENT }
  }
]
