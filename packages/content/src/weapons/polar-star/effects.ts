import type { CombatActionEffect } from "../../combat/types.js"

export const POLAR_STAR_SKILL_BURST_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const POLAR_STAR_ONE_STACK_ATTACK_PERCENT = [0.1, 0.125, 0.15, 0.175, 0.2] as const
export const POLAR_STAR_TWO_STACK_ATTACK_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const
// The pinned GO sheet says 52.8% at R4/three stacks, but official Chinese text fixes this as 52.5%.
export const POLAR_STAR_THREE_STACK_ATTACK_PERCENT = [0.3, 0.375, 0.45, 0.525, 0.6] as const
export const POLAR_STAR_FOUR_STACK_ATTACK_PERCENT = [0.48, 0.6, 0.72, 0.84, 0.96] as const

const stackEffects = [
  { stackCount: 1, values: POLAR_STAR_ONE_STACK_ATTACK_PERCENT },
  { stackCount: 2, values: POLAR_STAR_TWO_STACK_ATTACK_PERCENT },
  { stackCount: 3, values: POLAR_STAR_THREE_STACK_ATTACK_PERCENT },
  { stackCount: 4, values: POLAR_STAR_FOUR_STACK_ATTACK_PERCENT }
] as const

function createStackEffect(stack: (typeof stackEffects)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "polar-star-ashen-nightstar", variant: `${stack.stackCount}-stack` },
    id: `weapon.polar-star.ashen-nightstar.${stack.stackCount}-stack.attack-percent`,
    label: `冬极白星 · ${stack.stackCount}层白夜极星攻击力`,
    source: { kind: "weapon", weaponId: "PolarStar" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: stack.values }
  }
}

/** Typed automatic skill/burst and selected Ashen Nightstar stack contributions of Polar Star. */
export const polarStarCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.polar-star.skill-burst-damage-bonus",
    label: "冬极白星 · 元素战技与元素爆发伤害",
    source: { kind: "weapon", weaponId: "PolarStar" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill", "burst"] },
    value: { kind: "refinement_table", values: POLAR_STAR_SKILL_BURST_DAMAGE_BONUS }
  },
  ...stackEffects.map(createStackEffect)
]
