import type { CombatActionEffect } from "../../combat/types.js"

export const SILVERSHOWER_HEARTSTRINGS_ONE_STACK_HP_PERCENT = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const SILVERSHOWER_HEARTSTRINGS_TWO_STACK_HP_PERCENT = [0.24, 0.3, 0.36, 0.42, 0.48] as const
export const SILVERSHOWER_HEARTSTRINGS_THREE_STACK_HP_PERCENT = [0.4, 0.5, 0.6, 0.7, 0.8] as const
export const SILVERSHOWER_HEARTSTRINGS_THREE_STACK_BURST_CRIT_RATE = [0.28, 0.35, 0.42, 0.49, 0.56] as const

/** Typed selected Bond of Life stack contributions of Silvershower Heartstrings. */
export const silvershowerHeartstringsCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    selectionMode: "optional",
    exclusivity: { group: "silvershower-heartstrings-bond", variant: "one-stack" },
    id: "weapon.silvershower-heartstrings.bond.1-stack.hp-percent",
    label: "白雨心弦 · 一层生命之契生命值",
    source: { kind: "weapon", weaponId: "SilvershowerHeartstrings" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: SILVERSHOWER_HEARTSTRINGS_ONE_STACK_HP_PERCENT }
  },
  {
    activation: "active",
    selectionMode: "optional",
    exclusivity: { group: "silvershower-heartstrings-bond", variant: "two-stack" },
    id: "weapon.silvershower-heartstrings.bond.2-stack.hp-percent",
    label: "白雨心弦 · 两层生命之契生命值",
    source: { kind: "weapon", weaponId: "SilvershowerHeartstrings" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: SILVERSHOWER_HEARTSTRINGS_TWO_STACK_HP_PERCENT }
  },
  {
    activation: "active",
    selectionMode: "optional",
    exclusivity: { group: "silvershower-heartstrings-bond", variant: "three-stack" },
    id: "weapon.silvershower-heartstrings.bond.3-stack.hp-percent",
    label: "白雨心弦 · 三层生命之契生命值",
    source: { kind: "weapon", weaponId: "SilvershowerHeartstrings" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: SILVERSHOWER_HEARTSTRINGS_THREE_STACK_HP_PERCENT }
  },
  {
    activation: "active",
    selectionMode: "optional",
    exclusivity: { group: "silvershower-heartstrings-bond", variant: "three-stack" },
    id: "weapon.silvershower-heartstrings.bond.3-stack.burst-crit-rate",
    label: "白雨心弦 · 三层生命之契元素爆发暴击率",
    source: { kind: "weapon", weaponId: "SilvershowerHeartstrings" },
    target: "critRate",
    targetFilter: { talentSlots: ["burst"] },
    value: { kind: "refinement_table", values: SILVERSHOWER_HEARTSTRINGS_THREE_STACK_BURST_CRIT_RATE }
  }
]
