import type { CombatActionEffect } from "../../combat/types.js"

export const SERENITYS_CALL_AFTER_REACTION_HP_PERCENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const SERENITYS_CALL_AFTER_REACTION_FULL_MOON_HP_PERCENT = [0.32, 0.4, 0.48, 0.56, 0.64] as const

/** Typed selected reaction and full-moon health snapshots of Serenity's Call. */
export const serenitysCallCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    exclusivity: { group: "serenitys-call-reaction", variant: "standard" },
    id: "weapon.serenitys-call.after-reaction.hp-percent",
    label: "谧音吹哨 · 触发元素反应后的生命值",
    source: { kind: "weapon", weaponId: "SerenitysCall" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: SERENITYS_CALL_AFTER_REACTION_HP_PERCENT }
  },
  {
    activation: "active",
    condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
    exclusivity: { group: "serenitys-call-reaction", variant: "full-moon" },
    id: "weapon.serenitys-call.after-reaction.full-moon.hp-percent",
    label: "谧音吹哨 · 触发元素反应后月兆·满辉的生命值",
    source: { kind: "weapon", weaponId: "SerenitysCall" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: SERENITYS_CALL_AFTER_REACTION_FULL_MOON_HP_PERCENT }
  }
]
