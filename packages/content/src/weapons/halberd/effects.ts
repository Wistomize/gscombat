import type { CombatActionEffect } from "../../combat/types.js"

// The pinned GO sheet retains the official R1 160% value absent from the current HoYoWiki table.
export const HALBERD_PHYSICAL_COEFFICIENT = [1.6, 2, 2.4, 2.8, 3.2] as const

/** Typed selected cooldown-ready physical hit of Halberd. */
export const halberdCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.halberd.cooldown-ready.physical-hit",
    label: "钺矛 · 本次普攻触发沉重物理伤害（冷却已就绪）",
    source: { kind: "weapon", weaponId: "Halberd" },
    target: "additionalDamageEvent",
    targetFilter: { attackKinds: ["normal"] },
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: HALBERD_PHYSICAL_COEFFICIENT },
      element: "physical",
      expectedTriggerProbability: 1,
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  }
]
