import type { CombatActionEffect } from "../../combat/types.js"

export const FADING_TWILIGHT_EVENING_GLOW_DAMAGE_BONUS = [0.06, 0.075, 0.09, 0.105, 0.12] as const
export const FADING_TWILIGHT_AZURE_GLOW_DAMAGE_BONUS = [0.1, 0.125, 0.15, 0.175, 0.2] as const
export const FADING_TWILIGHT_DAWN_GLOW_DAMAGE_BONUS = [0.14, 0.175, 0.21, 0.245, 0.28] as const

/** Typed selected state contributions of Fading Twilight's cyclic glow. */
export const fadingTwilightCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    exclusivity: { group: "fading-twilight-glow", variant: "evening" },
    id: "weapon.fading-twilight.evening-glow.damage-bonus",
    label: "落霞 · 夕暮状态伤害",
    source: { kind: "weapon", weaponId: "FadingTwilight" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: FADING_TWILIGHT_EVENING_GLOW_DAMAGE_BONUS }
  },
  {
    activation: "active",
    exclusivity: { group: "fading-twilight-glow", variant: "azure" },
    id: "weapon.fading-twilight.azure-glow.damage-bonus",
    label: "落霞 · 流霞状态伤害",
    source: { kind: "weapon", weaponId: "FadingTwilight" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: FADING_TWILIGHT_AZURE_GLOW_DAMAGE_BONUS }
  },
  {
    activation: "active",
    exclusivity: { group: "fading-twilight-glow", variant: "dawn" },
    id: "weapon.fading-twilight.dawn-glow.damage-bonus",
    label: "落霞 · 朝晖状态伤害",
    source: { kind: "weapon", weaponId: "FadingTwilight" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: FADING_TWILIGHT_DAWN_GLOW_DAMAGE_BONUS }
  }
]
