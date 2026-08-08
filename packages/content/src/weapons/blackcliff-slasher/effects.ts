import type { CombatActionEffect } from "../../combat/types.js"

export const BLACKCLIFF_SLASHER_ONE_STACK_ATTACK_PERCENT = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const BLACKCLIFF_SLASHER_TWO_STACK_ATTACK_PERCENT = [0.24, 0.3, 0.36, 0.42, 0.48] as const
export const BLACKCLIFF_SLASHER_THREE_STACK_ATTACK_PERCENT = [0.36, 0.45, 0.54, 0.63, 0.72] as const

/** Typed selected defeated-enemy stack contributions of Blackcliff Slasher. */
export const blackcliffSlasherCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    selectionMode: "optional",
    exclusivity: { group: "blackcliff-slasher-defeated-enemy", variant: "one-stack" },
    id: "weapon.blackcliff-slasher.defeated-enemy.1-stack.attack-percent",
    label: "黑岩斩刀 · 击败敌人后的1层攻击力",
    source: { kind: "weapon", weaponId: "BlackcliffSlasher" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: BLACKCLIFF_SLASHER_ONE_STACK_ATTACK_PERCENT }
  },
  {
    activation: "active",
    selectionMode: "optional",
    exclusivity: { group: "blackcliff-slasher-defeated-enemy", variant: "two-stack" },
    id: "weapon.blackcliff-slasher.defeated-enemy.2-stack.attack-percent",
    label: "黑岩斩刀 · 击败敌人后的2层攻击力",
    source: { kind: "weapon", weaponId: "BlackcliffSlasher" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: BLACKCLIFF_SLASHER_TWO_STACK_ATTACK_PERCENT }
  },
  {
    activation: "active",
    selectionMode: "optional",
    exclusivity: { group: "blackcliff-slasher-defeated-enemy", variant: "three-stack" },
    id: "weapon.blackcliff-slasher.defeated-enemy.3-stack.attack-percent",
    label: "黑岩斩刀 · 击败敌人后的3层攻击力",
    source: { kind: "weapon", weaponId: "BlackcliffSlasher" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: BLACKCLIFF_SLASHER_THREE_STACK_ATTACK_PERCENT }
  }
]
