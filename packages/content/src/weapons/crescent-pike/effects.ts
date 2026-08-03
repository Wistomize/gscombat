import type { CombatActionEffect } from "../../combat/types.js"

export const CRESCENT_PIKE_AFTER_PARTICLE_COEFFICIENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const

/** Typed selected particle-window physical hit of Crescent Pike. */
export const crescentPikeCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.crescent-pike.after-particle.additional-physical-damage",
    label: "流月针 · 获得元素微粒或晶球后5秒内（本次普通攻击或重击额外物理伤害）",
    source: { kind: "weapon", weaponId: "CrescentPike" },
    target: "additionalDamageEvent",
    targetFilter: { attackKinds: ["normal", "charged"], talentSlots: ["normal"] },
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: CRESCENT_PIKE_AFTER_PARTICLE_COEFFICIENT },
      element: "physical",
      expectedTriggerProbability: 1,
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  }
]
