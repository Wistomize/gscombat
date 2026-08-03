import type { CombatActionEffect } from "../../combat/types.js"

export const MOUNTAIN_BRACING_BOLT_SKILL_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const

/** Typed self and selected teammate-skill-trigger contributions of Mountain-Bracing Bolt. */
export const mountainBracingBoltCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.mountain-bracing-bolt.skill-damage-bonus",
    label: "镇山之钉 · 元素战技伤害",
    source: { kind: "weapon", weaponId: "MountainBracingBolt" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill"] },
    value: { kind: "refinement_table", values: MOUNTAIN_BRACING_BOLT_SKILL_DAMAGE_BONUS }
  },
  {
    activation: "active",
    id: "weapon.mountain-bracing-bolt.after-teammate-skill.extra-skill-damage-bonus",
    label: "镇山之钉 · 队伍其他角色施放元素战技后的额外元素战技伤害",
    source: { kind: "weapon", weaponId: "MountainBracingBolt" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill"] },
    value: { kind: "refinement_table", values: MOUNTAIN_BRACING_BOLT_SKILL_DAMAGE_BONUS }
  }
]
