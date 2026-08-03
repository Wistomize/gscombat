import type { CombatActionEffect } from "../../combat/types.js"

export const FILLET_BLADE_PHYSICAL_COEFFICIENT = [2.4, 2.8, 3.2, 3.6, 4] as const
export const FILLET_BLADE_TRIGGER_COOLDOWN_SECONDS = [15, 14, 13, 12, 11] as const

/** Typed selected cooldown-ready expected physical hit of Fillet Blade. */
export const filletBladeCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.fillet-blade.cooldown-ready.expected-physical-hit",
    label: "吃虎鱼刀 · 当前攻击命中且冷却就绪时的决物理伤害期望",
    source: { kind: "weapon", weaponId: "FilletBlade" },
    target: "additionalDamageEvent",
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: FILLET_BLADE_PHYSICAL_COEFFICIENT },
      element: "physical",
      expectedTriggerProbability: 0.5,
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  }
]
