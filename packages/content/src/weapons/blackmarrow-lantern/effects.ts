import type { CombatActionEffect } from "../../combat/types.js"

export const BLACKMARROW_LANTERN_BLOOM_REACTION_DAMAGE_BONUS = [0.48, 0.6, 0.72, 0.84, 0.96] as const
export const BLACKMARROW_LANTERN_LUNAR_BLOOM_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const

/** Typed selected Bloom-reaction damage contribution of Blackmarrow Lantern. */
export const blackmarrowLanternCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.blackmarrow-lantern.bloom.reaction-damage-bonus",
    label: "乌髓孑灯 · 绽放反应伤害",
    source: { kind: "weapon", weaponId: "BlackmarrowLantern" },
    target: "reactionDamageBonus",
    targetFilter: { reactionKinds: ["bloom"] },
    value: { kind: "refinement_table", values: BLACKMARROW_LANTERN_BLOOM_REACTION_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    id: "weapon.blackmarrow-lantern.lunar-bloom.reaction-damage-bonus",
    label: "乌髓孑灯 · 月绽放反应伤害",
    source: { kind: "weapon", weaponId: "BlackmarrowLantern" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["lunar_bloom"] },
    value: { kind: "refinement_table", values: BLACKMARROW_LANTERN_LUNAR_BLOOM_DAMAGE_BONUS }
  },
  {
    activation: "active",
    condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
    id: "weapon.blackmarrow-lantern.full-moonsign.lunar-bloom.reaction-damage-bonus",
    label: "乌髓孑灯 · 月兆满辉时的月绽放反应伤害",
    source: { kind: "weapon", weaponId: "BlackmarrowLantern" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["lunar_bloom"] },
    value: { kind: "refinement_table", values: BLACKMARROW_LANTERN_LUNAR_BLOOM_DAMAGE_BONUS }
  }
]
