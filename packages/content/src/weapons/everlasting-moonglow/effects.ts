import type { CombatActionEffect } from "../../combat/types.js"

export const EVERLASTING_MOONGLOW_NORMAL_HP_ADDITIVE_DAMAGE = [0.01, 0.015, 0.02, 0.025, 0.03] as const

/** Typed unconditional normal-hit maximum-HP contribution of Everlasting Moonglow. */
export const everlastingMoonglowCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.everlasting-moonglow.normal-hp-additive-damage",
    label: "不灭月华 · 普通攻击生命值同一命中加算",
    source: { holder: "primary", kind: "weapon", weaponId: "EverlastingMoonglow" },
    target: "matchedActionAdditiveDamageTerm",
    targetFilter: { attackKinds: ["normal"] },
    value: {
      coefficient: { kind: "refinement_table", values: EVERLASTING_MOONGLOW_NORMAL_HP_ADDITIVE_DAMAGE },
      kind: "matched_action_additive_damage_term",
      scalingStat: "hp"
    }
  }
]
