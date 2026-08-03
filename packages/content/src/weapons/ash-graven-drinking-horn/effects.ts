import type { CombatActionEffect } from "../../combat/types.js"

export const ASH_GRAVEN_DRINKING_HORN_HP_COEFFICIENT = [0.4, 0.5, 0.6, 0.7, 0.8] as const

/** Typed selected cooldown-ready physical hit of Ash-Graven Drinking Horn. */
export const ashGravenDrinkingHornCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.ash-graven-drinking-horn.hp-physical-hit",
    label: "苍纹角杯 · 本次攻击触发基于生命值上限的物理伤害（冷却已就绪）",
    source: { kind: "weapon", weaponId: "AshGravenDrinkingHorn" },
    target: "additionalDamageEvent",
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: ASH_GRAVEN_DRINKING_HORN_HP_COEFFICIENT },
      element: "physical",
      expectedTriggerProbability: 1,
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "hp"
    }
  }
]
