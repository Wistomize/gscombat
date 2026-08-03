import type { CombatActionEffect } from "../../combat/types.js"

export const MESSENGER_WEAK_POINT_PHYSICAL_COEFFICIENT = [1, 1.25, 1.5, 1.75, 2] as const

/** Typed weak-point and cooldown-ready guaranteed-critical physical hit of Messenger. */
export const messengerCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.messenger.weak-point-guaranteed-crit.additional-damage",
    label: "信使 · 本次瞄准射击命中要害且冷却已就绪，触发必定暴击的物理附加伤害",
    source: { holder: "primary", kind: "weapon", weaponId: "Messenger" },
    target: "additionalDamageEvent",
    targetFilter: { attackKinds: ["charged"] },
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: MESSENGER_WEAK_POINT_PHYSICAL_COEFFICIENT },
      critPolicy: "guaranteed",
      element: "physical",
      expectedTriggerProbability: 1,
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  }
]
