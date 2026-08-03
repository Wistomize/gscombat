import type { CombatActionEffect } from "../../combat/types.js"

export const FINALE_OF_THE_DEEP_AFTER_SKILL_ATTACK_PERCENT = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const FINALE_OF_THE_DEEP_BOND_CLEARED_AT_CAP_FLAT_ATTACK = [150, 188, 225, 263, 300] as const

/** Typed selected post-skill attack contribution of Finale of the Deep. */
export const finaleOfTheDeepCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.finale-of-the-deep.after-skill.attack-percent",
    label: "海渊终曲 · 施放元素战技后的攻击力",
    source: { kind: "weapon", weaponId: "FinaleOfTheDeep" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: FINALE_OF_THE_DEEP_AFTER_SKILL_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "weapon.finale-of-the-deep.bond-of-life-cleared.at-cap.flat-attack",
    label: "海渊终曲 · 清除生命之契后攻击力达到上限（15秒内）",
    source: { kind: "weapon", weaponId: "FinaleOfTheDeep" },
    target: "flatAttack",
    value: { kind: "refinement_table", values: FINALE_OF_THE_DEEP_BOND_CLEARED_AT_CAP_FLAT_ATTACK }
  }
]
