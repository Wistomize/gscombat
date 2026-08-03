import type { CombatActionEffect } from "../../combat/types.js"

export const SNOW_TOMBED_STARSILVER_TRIGGER_PROBABILITY = [0.6, 0.7, 0.8, 0.9, 1] as const
export const SNOW_TOMBED_STARSILVER_STANDARD_PHYSICAL_COEFFICIENT = [0.8, 0.95, 1.1, 1.25, 1.4] as const
export const SNOW_TOMBED_STARSILVER_CRYO_AURA_PHYSICAL_COEFFICIENT = [2, 2.4, 2.8, 3.2, 3.6] as const

/** Typed cooldown-ready physical hits of Snow-Tombed Starsilver for the selected enemy aura snapshot. */
export const snowTombedStarsilverCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    exclusivity: { group: "snow-tombed-starsilver-frost-icicle", variant: "without-cryo-aura" },
    id: "weapon.snow-tombed-starsilver.frost-icicle.without-cryo-aura.physical-hit",
    label: "雪葬的星银 · 本次触发霜葬物理伤害（敌人未处于冰元素影响下）",
    source: { kind: "weapon", weaponId: "SnowTombedStarsilver" },
    target: "additionalDamageEvent",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: SNOW_TOMBED_STARSILVER_STANDARD_PHYSICAL_COEFFICIENT },
      element: "physical",
      expectedTriggerProbability: { kind: "refinement_table", values: SNOW_TOMBED_STARSILVER_TRIGGER_PROBABILITY },
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  },
  {
    activation: "active",
    exclusivity: { group: "snow-tombed-starsilver-frost-icicle", variant: "with-cryo-aura" },
    id: "weapon.snow-tombed-starsilver.frost-icicle.with-cryo-aura.physical-hit",
    label: "雪葬的星银 · 本次触发霜葬物理伤害（敌人处于冰元素影响下）",
    source: { kind: "weapon", weaponId: "SnowTombedStarsilver" },
    target: "additionalDamageEvent",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: SNOW_TOMBED_STARSILVER_CRYO_AURA_PHYSICAL_COEFFICIENT },
      element: "physical",
      expectedTriggerProbability: { kind: "refinement_table", values: SNOW_TOMBED_STARSILVER_TRIGGER_PROBABILITY },
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  }
]
