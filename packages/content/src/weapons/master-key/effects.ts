import type { CombatActionEffect } from "../../combat/types.js"

export const MASTER_KEY_AFTER_REACTION_ELEMENTAL_MASTERY = [60, 75, 90, 105, 120] as const
export const MASTER_KEY_AFTER_REACTION_FULL_MOON_ELEMENTAL_MASTERY = [120, 150, 180, 210, 240] as const

/** Typed selected reaction and full-moon elemental-mastery snapshots of Master Key. */
export const masterKeyCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    exclusivity: { group: "master-key-reaction", variant: "standard" },
    id: "weapon.master-key.after-reaction.elemental-mastery",
    label: "万能钥匙 · 触发元素反应后的元素精通",
    source: { kind: "weapon", weaponId: "MasterKey" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: MASTER_KEY_AFTER_REACTION_ELEMENTAL_MASTERY }
  },
  {
    activation: "active",
    condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
    exclusivity: { group: "master-key-reaction", variant: "full-moon" },
    id: "weapon.master-key.after-reaction.full-moon.elemental-mastery",
    label: "万能钥匙 · 触发元素反应后月兆·满辉的元素精通",
    source: { kind: "weapon", weaponId: "MasterKey" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: MASTER_KEY_AFTER_REACTION_FULL_MOON_ELEMENTAL_MASTERY }
  }
]
