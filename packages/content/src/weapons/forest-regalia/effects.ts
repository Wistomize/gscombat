import type { CombatActionEffect } from "../../combat/types.js"

export const FOREST_REGALIA_LEAF_ELEMENTAL_MASTERY = [60, 75, 90, 105, 120] as const

/** Typed selected Seed of Consciousness pickup contribution of Forest Regalia. */
export const forestRegaliaCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.forest-regalia.after-dendro-reaction.leaf-picked.elemental-mastery",
    label: "森林王器 · 拾取种识之叶后12秒内",
    source: { kind: "weapon", weaponId: "ForestRegalia" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: FOREST_REGALIA_LEAF_ELEMENTAL_MASTERY }
  }
]
