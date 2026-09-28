import type { CombatActionEffect } from "../../combat/types.js"

export const SKYRIDER_SWORD_AFTER_BURST_ATTACK_PERCENT = [0.12, 0.15, 0.18, 0.21, 0.24] as const

/** Typed selected post-burst attack contribution of Skyrider Sword. */
export const skyriderSwordCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: { kind: "conditional", preparation: "qualified", retention: "retain_on_exit", trigger: { event: "burst_cast", sourceFieldPresence: "on_field" }, explanation: "本人提前施放爆发，有效期内保留" },
    id: "weapon.skyrider-sword.after-burst.attack-percent",
    label: "飞天御剑 · 施放元素爆发后15秒内",
    source: { kind: "weapon", weaponId: "SkyriderSword" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: SKYRIDER_SWORD_AFTER_BURST_ATTACK_PERCENT }
  }
]
