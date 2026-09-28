import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const MASTER_KEY_AFTER_REACTION_ELEMENTAL_MASTERY = [60, 75, 90, 105, 120] as const
export const MASTER_KEY_AFTER_REACTION_FULL_MOON_ELEMENTAL_MASTERY = [120, 150, 180, 210, 240] as const

/** Typed selected reaction and full-moon elemental-mastery snapshots of Master Key. */
export const masterKeyCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily: "any", provider: "source", recipient: "source" }, "仅由装备者本人在当前队伍的合法准备能力触发，退场保留"),
    exclusivity: { group: "master-key-reaction", variant: "standard", automaticPriority: 1 },
    id: "weapon.master-key.after-reaction.elemental-mastery",
    label: "万能钥匙 · 触发元素反应后的元素精通",
    source: { kind: "weapon", weaponId: "MasterKey" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: MASTER_KEY_AFTER_REACTION_ELEMENTAL_MASTERY }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily: "any", provider: "source", recipient: "source" }, "仅由装备者本人在当前队伍的合法准备能力触发，退场保留"),
    condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
    exclusivity: { group: "master-key-reaction", variant: "full-moon", automaticPriority: 2 },
    id: "weapon.master-key.after-reaction.full-moon.elemental-mastery",
    label: "万能钥匙 · 触发元素反应后月兆·满辉的元素精通",
    source: { kind: "weapon", weaponId: "MasterKey" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: MASTER_KEY_AFTER_REACTION_FULL_MOON_ELEMENTAL_MASTERY }
  }
]
