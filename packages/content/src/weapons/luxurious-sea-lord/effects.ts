import type { CombatActionEffect } from "../../combat/types.js"

export const LUXURIOUS_SEA_LORD_BURST_DAMAGE_BONUS_BY_REFINEMENT = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const LUXURIOUS_SEA_LORD_TUNA_COEFFICIENT_BY_REFINEMENT = [1, 1.25, 1.5, 1.75, 2] as const

/** Typed Burst and selected on-cooldown tuna-impact contributions of Luxurious Sea-Lord. */
export const luxuriousSeaLordCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.luxurious-sea-lord.burst-damage-bonus",
    label: "衔珠海皇 · 元素爆发伤害",
    source: { kind: "weapon", weaponId: "LuxuriousSeaLord" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["burst"] },
    value: { kind: "refinement_table", values: LUXURIOUS_SEA_LORD_BURST_DAMAGE_BONUS_BY_REFINEMENT }
  },
  {
    activation: "active",
    id: "weapon.luxurious-sea-lord.tuna-impact",
    label: "衔珠海皇 · 大鲔冲击（本次元素爆发命中且15秒冷却已就绪）",
    source: { kind: "weapon", weaponId: "LuxuriousSeaLord" },
    target: "additionalDamageEvent",
    targetFilter: { talentSlots: ["burst"] },
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: LUXURIOUS_SEA_LORD_TUNA_COEFFICIENT_BY_REFINEMENT },
      element: "physical",
      expectedTriggerProbability: 1,
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  }
]
