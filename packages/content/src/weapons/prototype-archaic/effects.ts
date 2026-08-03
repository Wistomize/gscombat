import type { CombatActionEffect } from "../../combat/types.js"

export const PROTOTYPE_ARCHAIC_PHYSICAL_COEFFICIENT = [2.4, 3, 3.6, 4.2, 4.8] as const

/** Typed selected cooldown-ready physical hit of Prototype Archaic. */
export const prototypeArchaicCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.prototype-archaic.physical-hit",
    label: "试作古华 · 本次普通攻击或重击命中（15秒冷却已就绪）",
    source: { kind: "weapon", weaponId: "PrototypeArchaic" },
    target: "additionalDamageEvent",
    targetFilter: { attackKinds: ["normal", "charged"], talentSlots: ["normal"] },
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: PROTOTYPE_ARCHAIC_PHYSICAL_COEFFICIENT },
      element: "physical",
      expectedTriggerProbability: 0.5,
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  }
]
