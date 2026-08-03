import type { CombatActionEffect } from "../../combat/types.js"

export const DRAGONSPINE_SPEAR_TRIGGER_PROBABILITY = [0.6, 0.7, 0.8, 0.9, 1] as const
export const DRAGONSPINE_SPEAR_STANDARD_PHYSICAL_COEFFICIENT = [0.8, 0.95, 1.1, 1.25, 1.4] as const
export const DRAGONSPINE_SPEAR_CRYO_AURA_PHYSICAL_COEFFICIENT = [2, 2.4, 2.8, 3.2, 3.6] as const

/** Typed cooldown-ready physical hits of Dragonspine Spear for the selected enemy aura snapshot. */
export const dragonspineSpearCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    exclusivity: { group: "dragonspine-spear-frost-icicle", variant: "without-cryo-aura" },
    id: "weapon.dragonspine-spear.frost-icicle.without-cryo-aura.physical-hit",
    label: "龙脊长枪 · 本次触发霜葬物理伤害（敌人未处于冰元素影响下）",
    source: { kind: "weapon", weaponId: "DragonspineSpear" },
    target: "additionalDamageEvent",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: DRAGONSPINE_SPEAR_STANDARD_PHYSICAL_COEFFICIENT },
      element: "physical",
      expectedTriggerProbability: { kind: "refinement_table", values: DRAGONSPINE_SPEAR_TRIGGER_PROBABILITY },
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  },
  {
    activation: "active",
    exclusivity: { group: "dragonspine-spear-frost-icicle", variant: "with-cryo-aura" },
    id: "weapon.dragonspine-spear.frost-icicle.with-cryo-aura.physical-hit",
    label: "龙脊长枪 · 本次触发霜葬物理伤害（敌人处于冰元素影响下）",
    source: { kind: "weapon", weaponId: "DragonspineSpear" },
    target: "additionalDamageEvent",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: DRAGONSPINE_SPEAR_CRYO_AURA_PHYSICAL_COEFFICIENT },
      element: "physical",
      expectedTriggerProbability: { kind: "refinement_table", values: DRAGONSPINE_SPEAR_TRIGGER_PROBABILITY },
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  }
]
