import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const CINNABAR_SPINDLE_DEFENSE_ADDITIVE_DAMAGE = [0.4, 0.5, 0.6, 0.7, 0.8] as const

/** Same-hit skill DEF addition; authored event timing controls consumption and cooldown. */
export const cinnabarSpindleCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    hitConsumption: { clearAfterSeconds: 0.1, retriggerAfterSeconds: 1.5 },
    lifecycle: prepareWeaponEffect({ kind: "damage_hit", hitKinds: ["skill"], provider: "source", recipient: "source" }, "本次战技命中效果可用，不新增独立武器伤害"),
    id: "weapon.cinnabar-spindle.skill-hit-ready.albedo-transient-blossom.defense-additive-damage",
    label: "辰砂之纺锤 · 战技命中（冷却就绪）防御力同一命中加算",
    source: { holder: "primary", kind: "weapon", weaponId: "CinnabarSpindle" },
    target: "matchedActionAdditiveDamageTerm",
    targetFilter: {
      talentSlots: ["skill"]
    },
    value: {
      coefficient: { kind: "refinement_table", values: CINNABAR_SPINDLE_DEFENSE_ADDITIVE_DAMAGE },
      kind: "matched_action_additive_damage_term",
      scalingStat: "defense"
    }
  }
]
