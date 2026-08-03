import type { CombatActionEffect } from "../../combat/types.js"

export const DEBATE_CLUB_PHYSICAL_COEFFICIENT = [0.6, 0.75, 0.9, 1.05, 1.2] as const

/** Typed selected cooldown-ready post-skill physical hit of Debate Club. */
export const debateClubCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.debate-club.after-skill.physical-hit",
    label: "以理服人 · 此前施放元素战技后本次普攻或重击触发物理伤害（冷却已就绪）",
    source: { kind: "weapon", weaponId: "DebateClub" },
    target: "additionalDamageEvent",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: DEBATE_CLUB_PHYSICAL_COEFFICIENT },
      element: "physical",
      expectedTriggerProbability: 1,
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  }
]
