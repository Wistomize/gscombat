import type { CombatActionEffect } from "../../combat/types.js"

export const COVENANT_OF_FROST_AND_SNOW_ELEMENTAL_MASTERY = [120, 150, 180, 210, 240] as const

/** Typed post-skill elemental-mastery contribution of Covenant of Frost and Snow. */
export const covenantOfFrostAndSnowCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.covenant-of-frost-and-snow.after-skill.elemental-mastery",
    label: "霜雪誓约 · 施放元素战技后的元素精通（12秒内）",
    source: { kind: "weapon", weaponId: "CovenantOfFrostAndSnow" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: COVENANT_OF_FROST_AND_SNOW_ELEMENTAL_MASTERY }
  }
]
