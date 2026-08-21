import type { CombatActionEffect } from "../../combat/types.js"

export const WHITELAKE_FROSTFEATHER_THREE_STACK_ATTACK_PERCENT = [0.24, 0.3, 0.36, 0.42, 0.48] as const
export const WHITELAKE_FROSTFEATHER_STELLAR_REACTION_CRIT_DAMAGE = [0.5, 0.65, 0.8, 0.95, 1.1] as const

/** Typed maximum Lake-Hued Lament contribution of Whitelake Frostfeather. */
export const whitelakeFrostfeatherCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "maximum_reachable",
    id: "weapon.whitelake-frostfeather.lake-hued-lament.3-stack.attack-percent",
    label: "白湖冬羽 · 湖色的哀告三层攻击力",
    source: { kind: "weapon", weaponId: "WhitelakeFrostfeather" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: WHITELAKE_FROSTFEATHER_THREE_STACK_ATTACK_PERCENT }
  },
  {
    activation: "maximum_reachable",
    id: "weapon.whitelake-frostfeather.lake-hued-lament.3-stack.stellar-reaction-crit-damage",
    label: "白湖冬羽 · 湖色的哀告三层时的星烁反应暴击伤害",
    source: { kind: "weapon", weaponId: "WhitelakeFrostfeather" },
    target: "critDamage",
    targetFilter: { specialReactionKinds: ["stellar_superconduct", "stellar_swirl"] },
    value: { kind: "refinement_table", values: WHITELAKE_FROSTFEATHER_STELLAR_REACTION_CRIT_DAMAGE }
  }
]
