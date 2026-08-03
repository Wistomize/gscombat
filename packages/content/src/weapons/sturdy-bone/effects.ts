import type { CombatActionEffect } from "../../combat/types.js"

export const STURDY_BONE_SPRINT_FOLLOWUP_NORMAL_ATTACK_ADDITIVE_DAMAGE = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed selected post-sprint normal-hit contribution of Sturdy Bone. */
export const sturdyBoneCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.sturdy-bone.sprint-followup.normal-attack-additive-damage",
    label: "弥坚骨 · 冲刺后的18次普通攻击（7秒内）攻击力同一命中加算",
    source: { holder: "primary", kind: "weapon", weaponId: "SturdyBone" },
    target: "matchedActionAdditiveDamageTerm",
    targetFilter: { attackKinds: ["normal"] },
    value: {
      coefficient: { kind: "refinement_table", values: STURDY_BONE_SPRINT_FOLLOWUP_NORMAL_ATTACK_ADDITIVE_DAMAGE },
      kind: "matched_action_additive_damage_term",
      scalingStat: "attack"
    }
  }
]
