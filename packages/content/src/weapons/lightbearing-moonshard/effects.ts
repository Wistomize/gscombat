import type { CombatActionEffect } from "../../combat/types.js"

export const LIGHTBEARING_MOONSHARD_DEFENSE_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const LIGHTBEARING_MOONSHARD_AFTER_SKILL_LUNAR_CRYSTALLIZE_DAMAGE_BONUS = [
  0.64,
  0.8,
  0.96,
  1.12,
  1.28
] as const

/** Typed automatic defense contribution of Lightbearing Moonshard. */
export const lightbearingMoonshardCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.lightbearing-moonshard.defense-percent",
    label: "朏魄含光 · 防御力",
    source: { kind: "weapon", weaponId: "LightbearingMoonshard" },
    target: "defensePercent",
    value: { kind: "refinement_table", values: LIGHTBEARING_MOONSHARD_DEFENSE_PERCENT }
  },
  {
    activation: "active",
    id: "weapon.lightbearing-moonshard.after-skill.lunar-crystallize.reaction-damage-bonus",
    label: "朏魄含光 · 元素战技后的月结晶伤害",
    source: { kind: "weapon", weaponId: "LightbearingMoonshard" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["lunar_crystallize"] },
    value: { kind: "refinement_table", values: LIGHTBEARING_MOONSHARD_AFTER_SKILL_LUNAR_CRYSTALLIZE_DAMAGE_BONUS }
  }
]
