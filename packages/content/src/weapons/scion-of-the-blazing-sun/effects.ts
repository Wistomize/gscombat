import type { CombatActionEffect } from "../../combat/types.js"

export const SCION_OF_THE_BLAZING_SUN_PHYSICAL_COEFFICIENT = [0.6, 0.75, 0.9, 1.05, 1.2] as const
export const SCION_OF_THE_BLAZING_SUN_CHARGED_DAMAGE_BONUS = [0.28, 0.35, 0.42, 0.49, 0.56] as const

/** Typed selected Sunfire Arrow event and Heartsearer-target charged-damage contribution. */
export const scionOfTheBlazingSunCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.scion-of-the-blazing-sun.sunfire-arrow.physical-hit",
    label: "烈阳之嗣 · 本次重击触发阳炎矢物理伤害（冷却已就绪）",
    source: { kind: "weapon", weaponId: "ScionOfTheBlazingSun" },
    target: "additionalDamageEvent",
    targetFilter: { attackKinds: ["charged"] },
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: SCION_OF_THE_BLAZING_SUN_PHYSICAL_COEFFICIENT },
      element: "physical",
      expectedTriggerProbability: 1,
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  },
  {
    activation: "active",
    id: "weapon.scion-of-the-blazing-sun.heartsearer-target.charged-damage-bonus",
    label: "烈阳之嗣 · 当前目标已有灼心时的重击伤害",
    source: { kind: "weapon", weaponId: "ScionOfTheBlazingSun" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["charged"] },
    value: { kind: "refinement_table", values: SCION_OF_THE_BLAZING_SUN_CHARGED_DAMAGE_BONUS }
  }
]
