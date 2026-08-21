import type { CombatActionEffect } from "../../combat/types.js"

export const EMBERWELL_ATTACK_PERCENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const EMBERWELL_STELLAR_REACTION_DAMAGE_BONUS = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed post-reaction contributions of Emberwell. */
export const emberwellCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.emberwell.after-reaction.attack-percent",
    label: "引火之源 · 触发元素反应后的攻击力（12秒内）",
    source: { kind: "weapon", weaponId: "Emberwell" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: EMBERWELL_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "weapon.emberwell.after-stellar-reaction.reaction-damage-bonus",
    label: "引火之源 · 触发星烁反应后的星超导/星扩散伤害（12秒内）",
    source: { kind: "weapon", weaponId: "Emberwell" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["stellar_superconduct", "stellar_swirl"] },
    value: { kind: "refinement_table", values: EMBERWELL_STELLAR_REACTION_DAMAGE_BONUS }
  }
]
