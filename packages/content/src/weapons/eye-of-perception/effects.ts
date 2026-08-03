import type { CombatActionEffect } from "../../combat/types.js"

export const EYE_OF_PERCEPTION_INITIAL_PHYSICAL_COEFFICIENT = [2.4, 2.7, 3, 3.3, 3.6] as const

/** Typed initial cooldown-ready physical projectile of Eye of Perception before any unsupported bounce routing. */
export const eyeOfPerceptionCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.eye-of-perception.initial-projectile.physical-hit",
    label: "昭心 · 本次攻击触发首发法球物理伤害（冷却已就绪）",
    source: { kind: "weapon", weaponId: "EyeOfPerception" },
    target: "additionalDamageEvent",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: EYE_OF_PERCEPTION_INITIAL_PHYSICAL_COEFFICIENT },
      element: "physical",
      expectedTriggerProbability: 0.5,
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  }
]
