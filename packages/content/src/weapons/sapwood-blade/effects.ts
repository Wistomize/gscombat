import type { CombatActionEffect } from "../../combat/types.js"

export const SAPWOOD_BLADE_LEAF_ELEMENTAL_MASTERY = [60, 75, 90, 105, 120] as const

/** Typed selected Seed of Consciousness pickup contribution of Sapwood Blade. */
export const sapwoodBladeCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.sapwood-blade.after-dendro-reaction.leaf-picked.elemental-mastery",
    label: "原木刀 · 拾取种识之叶后12秒内",
    source: { holder: "party_member", kind: "weapon", weaponId: "SapwoodBlade" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: SAPWOOD_BLADE_LEAF_ELEMENTAL_MASTERY }
  }
]
