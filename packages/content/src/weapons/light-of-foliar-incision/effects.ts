import type { CombatActionEffect } from "../../combat/types.js"

export const LIGHT_OF_FOLIAR_INCISION_CRIT_RATE = [0.04, 0.05, 0.06, 0.07, 0.08] as const
export const LIGHT_OF_FOLIAR_INCISION_FOLIAR_INCISIVENESS_EM_ADDITIVE_DAMAGE = [1.2, 1.5, 1.8, 2.1, 2.4] as const

/** Typed automatic and selected current-action contributions of Light of Foliar Incision. */
export const lightOfFoliarIncisionCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.light-of-foliar-incision.crit-rate",
    label: "裁叶萃光 · 暴击率",
    source: { holder: "primary", kind: "weapon", weaponId: "LightOfFoliarIncision" },
    target: "critRate",
    value: { kind: "refinement_table", values: LIGHT_OF_FOLIAR_INCISION_CRIT_RATE }
  },
  {
    activation: "active",
    id: "weapon.light-of-foliar-incision.foliar-incisiveness.normal-em-additive-damage",
    label: "裁叶萃光 · 白月枝芒普通攻击元素精通同一命中加算",
    source: { holder: "primary", kind: "weapon", weaponId: "LightOfFoliarIncision" },
    target: "matchedActionAdditiveDamageTerm",
    targetFilter: { attackKinds: ["normal"] },
    value: {
      coefficient: { kind: "refinement_table", values: LIGHT_OF_FOLIAR_INCISION_FOLIAR_INCISIVENESS_EM_ADDITIVE_DAMAGE },
      kind: "matched_action_additive_damage_term",
      scalingStat: "elementalMastery"
    }
  },
  {
    activation: "active",
    id: "weapon.light-of-foliar-incision.foliar-incisiveness.skill-em-additive-damage",
    label: "裁叶萃光 · 白月枝芒元素战技元素精通同一命中加算",
    source: { holder: "primary", kind: "weapon", weaponId: "LightOfFoliarIncision" },
    target: "matchedActionAdditiveDamageTerm",
    targetFilter: { talentSlots: ["skill"] },
    value: {
      coefficient: { kind: "refinement_table", values: LIGHT_OF_FOLIAR_INCISION_FOLIAR_INCISIVENESS_EM_ADDITIVE_DAMAGE },
      kind: "matched_action_additive_damage_term",
      scalingStat: "elementalMastery"
    }
  }
]
