import type { CombatActionEffect } from "../../combat/types.js"

export const CINNABAR_SPINDLE_DEFENSE_ADDITIVE_DAMAGE = [0.4, 0.5, 0.6, 0.7, 0.8] as const

/** Typed explicit cooldown-ready Cinnabar Spindle contribution for Albedo's single Transient Blossom hit. */
export const cinnabarSpindleCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.cinnabar-spindle.skill-hit-ready.albedo-transient-blossom.defense-additive-damage",
    label: "辰砂之纺锤 · 阿贝多单次刹那之花（本次武器冷却就绪）防御力同一命中加算",
    source: { holder: "primary", kind: "weapon", weaponId: "CinnabarSpindle" },
    target: "matchedActionAdditiveDamageTerm",
    targetFilter: {
      actionIds: ["albedo.skill.transient_blossom"],
      recipientCharacterIds: ["Albedo"]
    },
    value: {
      coefficient: { kind: "refinement_table", values: CINNABAR_SPINDLE_DEFENSE_ADDITIVE_DAMAGE },
      kind: "matched_action_additive_damage_term",
      scalingStat: "defense"
    }
  }
]
