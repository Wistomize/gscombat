import type { CombatActionEffect } from "../../combat/types.js"

export const HUNTERS_PATH_ALL_ELEMENT_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const HUNTERS_PATH_TIRELESS_HUNT_CHARGED_EM_ADDITIVE_DAMAGE = [1.6, 2, 2.4, 2.8, 3.2] as const

const elementalDamageElements = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] as const

/** Typed automatic and selected current-action contributions of Hunter's Path. */
export const huntersPathCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.hunters-path.all-element-damage-bonus",
    label: "猎人之径 · 所有元素伤害",
    source: { holder: "primary", kind: "weapon", weaponId: "HuntersPath" },
    target: "damageBonus",
    targetFilter: { elements: elementalDamageElements },
    value: { kind: "refinement_table", values: HUNTERS_PATH_ALL_ELEMENT_DAMAGE_BONUS }
  },
  {
    activation: "active",
    id: "weapon.hunters-path.tireless-hunt.charged-em-additive-damage",
    label: "猎人之径 · 无休止的狩猎重击元素精通同一命中加算",
    source: { holder: "primary", kind: "weapon", weaponId: "HuntersPath" },
    target: "matchedActionAdditiveDamageTerm",
    targetFilter: { attackKinds: ["charged"] },
    value: {
      coefficient: { kind: "refinement_table", values: HUNTERS_PATH_TIRELESS_HUNT_CHARGED_EM_ADDITIVE_DAMAGE },
      kind: "matched_action_additive_damage_term",
      scalingStat: "elementalMastery"
    }
  }
]
