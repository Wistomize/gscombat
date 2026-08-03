import type { CombatActionEffect } from "../../combat/types.js"

export const BLACKCLIFF_LONGSWORD_ONE_STACK_ATTACK_PERCENT = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const BLACKCLIFF_LONGSWORD_TWO_STACK_ATTACK_PERCENT = [0.24, 0.3, 0.36, 0.42, 0.48] as const
export const BLACKCLIFF_LONGSWORD_THREE_STACK_ATTACK_PERCENT = [0.36, 0.45, 0.54, 0.63, 0.72] as const

/** Typed selected defeated-enemy stack contributions of Blackcliff Longsword. */
export const blackcliffLongswordCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    exclusivity: { group: "blackcliff-longsword-defeated-enemy", variant: "one-stack" },
    id: "weapon.blackcliff-longsword.defeated-enemy.1-stack.attack-percent",
    label: "黑岩长剑 · 击败敌人后的1层攻击力",
    source: { kind: "weapon", weaponId: "BlackcliffLongsword" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: BLACKCLIFF_LONGSWORD_ONE_STACK_ATTACK_PERCENT }
  },
  {
    activation: "active",
    exclusivity: { group: "blackcliff-longsword-defeated-enemy", variant: "two-stack" },
    id: "weapon.blackcliff-longsword.defeated-enemy.2-stack.attack-percent",
    label: "黑岩长剑 · 击败敌人后的2层攻击力",
    source: { kind: "weapon", weaponId: "BlackcliffLongsword" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: BLACKCLIFF_LONGSWORD_TWO_STACK_ATTACK_PERCENT }
  },
  {
    activation: "active",
    exclusivity: { group: "blackcliff-longsword-defeated-enemy", variant: "three-stack" },
    id: "weapon.blackcliff-longsword.defeated-enemy.3-stack.attack-percent",
    label: "黑岩长剑 · 击败敌人后的3层攻击力",
    source: { kind: "weapon", weaponId: "BlackcliffLongsword" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: BLACKCLIFF_LONGSWORD_THREE_STACK_ATTACK_PERCENT }
  }
]
