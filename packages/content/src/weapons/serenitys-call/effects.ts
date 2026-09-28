import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const SERENITYS_CALL_AFTER_REACTION_HP_PERCENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const SERENITYS_CALL_AFTER_REACTION_FULL_MOON_HP_PERCENT = [0.32, 0.4, 0.48, 0.56, 0.64] as const

/** Typed selected reaction and full-moon health snapshots of Serenity's Call. */
export const serenitysCallCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily: "any", provider: "source", recipient: "source" }, "仅由装备者本人在当前队伍的合法准备能力触发，退场保留"),
    exclusivity: { group: "serenitys-call-reaction", variant: "standard", automaticPriority: 1 },
    id: "weapon.serenitys-call.after-reaction.hp-percent",
    label: "谧音吹哨 · 触发元素反应后的生命值",
    source: { kind: "weapon", weaponId: "SerenitysCall" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: SERENITYS_CALL_AFTER_REACTION_HP_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily: "any", provider: "source", recipient: "source" }, "仅由装备者本人在当前队伍的合法准备能力触发，退场保留"),
    condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
    exclusivity: { group: "serenitys-call-reaction", variant: "full-moon", automaticPriority: 2 },
    id: "weapon.serenitys-call.after-reaction.full-moon.hp-percent",
    label: "谧音吹哨 · 触发元素反应后月兆·满辉的生命值",
    source: { kind: "weapon", weaponId: "SerenitysCall" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: SERENITYS_CALL_AFTER_REACTION_FULL_MOON_HP_PERCENT }
  }
]
