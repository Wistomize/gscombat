import type { CombatActionEffect } from "../../combat/types.js"

export const END_OF_THE_LINE_PHYSICAL_COEFFICIENT = [0.8, 1, 1.2, 1.4, 1.6] as const

/** Typed selected active physical hit of End of the Line while Flowrider remains available. */
export const endOfTheLineCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.end-of-the-line.flowrider.physical-hit",
    label: "竭泽 · 本次攻击触发沿洄物理伤害（状态有效且可触发）",
    source: { kind: "weapon", weaponId: "EndOfTheLine" },
    target: "additionalDamageEvent",
    targetFilter: { attackKinds: ["normal", "charged", "plunge"] },
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: END_OF_THE_LINE_PHYSICAL_COEFFICIENT },
      element: "physical",
      expectedTriggerProbability: 1,
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  }
]
