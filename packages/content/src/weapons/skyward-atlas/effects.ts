import type { CombatActionEffect } from "../../combat/types.js"

export const SKYWARD_ATLAS_ALL_ELEMENT_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const

const elementalDamageElements = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] as const

/** Typed automatic elemental-damage contribution of Skyward Atlas. */
export const skywardAtlasCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.skyward-atlas.all-element-damage-bonus",
    label: "天空之卷 · 所有元素伤害",
    source: { kind: "weapon", weaponId: "SkywardAtlas" },
    target: "damageBonus",
    targetFilter: { elements: elementalDamageElements },
    value: { kind: "refinement_table", values: SKYWARD_ATLAS_ALL_ELEMENT_DAMAGE_BONUS }
  }
]
