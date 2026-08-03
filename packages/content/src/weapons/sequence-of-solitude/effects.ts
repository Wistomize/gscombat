import type { CombatActionEffect } from "../../combat/types.js"

export const SEQUENCE_OF_SOLITUDE_HP_COEFFICIENT = [0.4, 0.5, 0.6, 0.7, 0.8] as const

/** Typed cooldown-ready physical hit of Sequence of Solitude. */
export const sequenceOfSolitudeCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.sequence-of-solitude.hp-physical-hit",
    label: "冷寂迸音 · 本次攻击触发基于生命值上限的物理伤害（冷却已就绪）",
    source: { kind: "weapon", weaponId: "SequenceOfSolitude" },
    target: "additionalDamageEvent",
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: SEQUENCE_OF_SOLITUDE_HP_COEFFICIENT },
      element: "physical",
      expectedTriggerProbability: 1,
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "hp"
    }
  }
]
