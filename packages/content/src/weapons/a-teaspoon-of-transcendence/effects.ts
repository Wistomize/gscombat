import type { CombatActionEffect } from "../../combat/types.js"

export const A_TEASPOON_OF_TRANSCENDENCE_ATTACK_PERCENT = [0.28, 0.35, 0.42, 0.49, 0.56] as const
export const A_TEASPOON_OF_TRANSCENDENCE_STELLAR_SUPERCONDUCT_DAMAGE_BONUS_PER_STACK = [
  0.16,
  0.2,
  0.24,
  0.28,
  0.32
] as const

const transcendenceStackCounts = [1, 2, 3] as const

function getTranscendenceStackValues(stackCount: number): readonly number[] {
  return A_TEASPOON_OF_TRANSCENDENCE_STELLAR_SUPERCONDUCT_DAMAGE_BONUS_PER_STACK.map(
    (value) => value * stackCount
  )
}

function createTranscendenceStackEffect(
  stackCount: (typeof transcendenceStackCounts)[number]
): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "a-teaspoon-of-transcendence-transcendence", variant: `${stackCount}-stack` },
    id: `weapon.a-teaspoon-of-transcendence.charged-hit.${stackCount}-stack.star-superconduct-damage-bonus`,
    label: `超越之匙 · 重击命中后的${stackCount}层超越（星超导伤害）`,
    source: { kind: "weapon", weaponId: "ATeaspoonOfTranscendence" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["stellar_superconduct"] },
    value: { kind: "refinement_table", values: getTranscendenceStackValues(stackCount) }
  }
}

/** Typed self attack contribution of A Teaspoon of Transcendence. */
export const aTeaspoonOfTranscendenceCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.a-teaspoon-of-transcendence.attack-percent",
    label: "超越之匙 · 攻击力",
    source: { kind: "weapon", weaponId: "ATeaspoonOfTranscendence" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: A_TEASPOON_OF_TRANSCENDENCE_ATTACK_PERCENT }
  },
  ...transcendenceStackCounts.map(createTranscendenceStackEffect)
]
