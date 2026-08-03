import type { CombatActionEffect } from "../../combat/types.js"

// The pinned GO sheet hard-codes 200%, while official Chinese text defines the complete refinement table.
export const THE_FLUTE_PHYSICAL_COEFFICIENT = [1, 1.25, 1.5, 1.75, 2] as const

/** Typed five-Harmonic current-hit physical event of The Flute. */
export const theFluteCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.the-flute.five-harmonic.physical-hit",
    label: "笛剑 · 五个和音后本次触发物理伤害",
    source: { kind: "weapon", weaponId: "TheFlute" },
    target: "additionalDamageEvent",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: THE_FLUTE_PHYSICAL_COEFFICIENT },
      element: "physical",
      expectedTriggerProbability: 1,
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  }
]
