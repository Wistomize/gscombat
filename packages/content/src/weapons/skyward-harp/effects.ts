import type { CombatActionEffect } from "../../combat/types.js"

export const SKYWARD_HARP_CRIT_DAMAGE = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const SKYWARD_HARP_PHYSICAL_COEFFICIENT = 1.25
export const SKYWARD_HARP_TRIGGER_PROBABILITY = [0.6, 0.7, 0.8, 0.9, 1] as const

/** Typed self critical-damage and cooldown-ready physical-hit contributions of Skyward Harp. */
export const skywardHarpCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.skyward-harp.crit-damage",
    label: "天空之翼 · 暴击伤害",
    source: { kind: "weapon", weaponId: "SkywardHarp" },
    target: "critDamage",
    value: { kind: "refinement_table", values: SKYWARD_HARP_CRIT_DAMAGE }
  },
  {
    activation: "active",
    id: "weapon.skyward-harp.physical-hit",
    label: "天空之翼 · 本次攻击触发物理伤害（冷却已就绪）",
    source: { kind: "weapon", weaponId: "SkywardHarp" },
    target: "additionalDamageEvent",
    value: {
      canCrit: true,
      coefficient: { kind: "fixed", value: SKYWARD_HARP_PHYSICAL_COEFFICIENT },
      element: "physical",
      expectedTriggerProbability: { kind: "refinement_table", values: SKYWARD_HARP_TRIGGER_PROBABILITY },
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  }
]
