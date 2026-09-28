import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const SNARE_HOOK_AFTER_REACTION_ELEMENTAL_MASTERY = [60, 75, 90, 105, 120] as const
export const SNARE_HOOK_AFTER_REACTION_FULL_MOON_ELEMENTAL_MASTERY = [120, 150, 180, 210, 240] as const

/** Typed selected reaction and full-moon elemental-mastery snapshots of Snare Hook. */
export const snareHookCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily: "any", provider: "source", recipient: "source" }, "仅由装备者本人在当前队伍的合法准备能力触发，退场保留"),
    exclusivity: { group: "snare-hook-reaction", variant: "standard", automaticPriority: 1 },
    id: "weapon.snare-hook.after-reaction.elemental-mastery",
    label: "罗网勾针 · 触发元素反应后的元素精通",
    source: { kind: "weapon", weaponId: "SnareHook" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: SNARE_HOOK_AFTER_REACTION_ELEMENTAL_MASTERY }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily: "any", provider: "source", recipient: "source" }, "仅由装备者本人在当前队伍的合法准备能力触发，退场保留"),
    condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
    exclusivity: { group: "snare-hook-reaction", variant: "full-moon", automaticPriority: 2 },
    id: "weapon.snare-hook.after-reaction.full-moon.elemental-mastery",
    label: "罗网勾针 · 触发元素反应后月兆·满辉的元素精通",
    source: { kind: "weapon", weaponId: "SnareHook" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: SNARE_HOOK_AFTER_REACTION_FULL_MOON_ELEMENTAL_MASTERY }
  }
]
