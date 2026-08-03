import type { CombatActionEffect } from "../../combat/types.js"

export const KAGOTSURUBE_ISSHIN_ATTACK_PERCENT = 0.15
export const KAGOTSURUBE_ISSHIN_PHYSICAL_COEFFICIENT = 1.8

/** Typed selected physical hit and post-hit attack contribution of Kagotsurube Isshin. */
export const kagotsurubeIsshinCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.kagotsurube-isshin.physical-hit",
    label: "笼钓瓶一心 · 本次普通攻击、重击或下落攻击命中（8秒冷却已就绪）",
    source: { kind: "weapon", weaponId: "KagotsurubeIsshin" },
    target: "additionalDamageEvent",
    targetFilter: { attackKinds: ["normal", "charged", "plunge"] },
    value: {
      canCrit: true,
      coefficient: { kind: "fixed", value: KAGOTSURUBE_ISSHIN_PHYSICAL_COEFFICIENT },
      element: "physical",
      expectedTriggerProbability: 1,
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  },
  {
    activation: "active",
    id: "weapon.kagotsurube-isshin.after-hit.attack-percent",
    label: "笼钓瓶一心 · 触发物理伤害后8秒内（当前动作前已生效）",
    source: { kind: "weapon", weaponId: "KagotsurubeIsshin" },
    target: "attackPercent",
    value: { kind: "fixed", value: KAGOTSURUBE_ISSHIN_ATTACK_PERCENT }
  }
]
