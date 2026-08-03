import type { CombatActionEffect } from "../../combat/types.js"

export const NOCTURNES_CURTAIN_CALL_HP_PERCENT = [0.1, 0.12, 0.14, 0.16, 0.18] as const
export const NOCTURNES_CURTAIN_CALL_AFTER_LUNAR_REACTION_HP_PERCENT = [0.14, 0.16, 0.18, 0.2, 0.22] as const
export const NOCTURNES_CURTAIN_CALL_AFTER_LUNAR_REACTION_LUNAR_CRIT_DAMAGE = [0.6, 0.8, 1, 1.2, 1.4] as const

/** Typed automatic and selected lunar-reaction health contributions of Nocturne's Curtain Call. */
export const nocturnesCurtainCallCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.nocturnes-curtain-call.hp-percent",
    label: "帷间夜曲 · 生命值",
    source: { kind: "weapon", weaponId: "NocturnesCurtainCall" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: NOCTURNES_CURTAIN_CALL_HP_PERCENT }
  },
  {
    activation: "active",
    id: "weapon.nocturnes-curtain-call.after-lunar-reaction.extra-hp-percent",
    label: "帷间夜曲 · 丰饶海的神酒状态下的额外生命值",
    source: { kind: "weapon", weaponId: "NocturnesCurtainCall" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: NOCTURNES_CURTAIN_CALL_AFTER_LUNAR_REACTION_HP_PERCENT }
  },
  {
    activation: "active",
    id: "weapon.nocturnes-curtain-call.after-lunar-reaction.lunar-crit-damage",
    label: "帷间夜曲 · 丰饶海的神酒状态下的月曜暴击伤害",
    source: { kind: "weapon", weaponId: "NocturnesCurtainCall" },
    target: "critDamage",
    targetFilter: { specialReactionKinds: ["lunar_bloom", "lunar_charged", "lunar_crystallize"] },
    value: { kind: "refinement_table", values: NOCTURNES_CURTAIN_CALL_AFTER_LUNAR_REACTION_LUNAR_CRIT_DAMAGE }
  }
]
