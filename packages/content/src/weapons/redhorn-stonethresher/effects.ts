import type { CombatActionEffect } from "../../combat/types.js"

export const REDHORN_STONETHRESHER_DEFENSE_PERCENT = [0.28, 0.35, 0.42, 0.49, 0.56] as const
export const REDHORN_STONETHRESHER_NORMAL_CHARGED_DEFENSE_ADDITIVE_DAMAGE = [0.4, 0.5, 0.6, 0.7, 0.8] as const

/** Typed automatic stat and same-hit defense contributions of Redhorn Stonethresher. */
export const redhornStonethresherCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.redhorn-stonethresher.defense-percent",
    label: "赤角石溃杵 · 防御力",
    source: { holder: "primary", kind: "weapon", weaponId: "RedhornStonethresher" },
    target: "defensePercent",
    value: { kind: "refinement_table", values: REDHORN_STONETHRESHER_DEFENSE_PERCENT }
  },
  {
    activation: "automatic",
    id: "weapon.redhorn-stonethresher.normal-charged-defense-additive-damage",
    label: "赤角石溃杵 · 普通攻击与重击防御力同一命中加算",
    source: { holder: "primary", kind: "weapon", weaponId: "RedhornStonethresher" },
    target: "matchedActionAdditiveDamageTerm",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: {
      coefficient: { kind: "refinement_table", values: REDHORN_STONETHRESHER_NORMAL_CHARGED_DEFENSE_ADDITIVE_DAMAGE },
      kind: "matched_action_additive_damage_term",
      scalingStat: "defense"
    }
  }
]
