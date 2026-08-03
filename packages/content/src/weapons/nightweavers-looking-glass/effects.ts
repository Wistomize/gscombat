import type { CombatActionEffect } from "../../combat/types.js"

export const NIGHTWEAVERS_LOOKING_GLASS_AFTER_HYDRO_OR_DENDRO_SKILL_ELEMENTAL_MASTERY = [60, 75, 90, 105, 120] as const
export const NIGHTWEAVERS_LOOKING_GLASS_AFTER_LUNAR_BLOOM_ELEMENTAL_MASTERY = [60, 75, 90, 105, 120] as const
export const NIGHTWEAVERS_LOOKING_GLASS_BLOOM_REACTION_DAMAGE_BONUS = [1.2, 1.5, 1.8, 2.1, 2.4] as const
export const NIGHTWEAVERS_LOOKING_GLASS_HYPERBLOOM_AND_BURGEON_REACTION_DAMAGE_BONUS = [0.8, 1, 1.2, 1.4, 1.6] as const
export const NIGHTWEAVERS_LOOKING_GLASS_LUNAR_BLOOM_DAMAGE_BONUS = [0.4, 0.5, 0.6, 0.7, 0.8] as const

/** Typed independent self elemental-mastery states of Nightweaver's Looking Glass. */
export const nightweaversLookingGlassCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.nightweavers-looking-glass.after-hydro-or-dendro-skill.elemental-mastery",
    label: "纺夜天镜 · 水或草元素战技命中后的元素精通",
    source: { kind: "weapon", weaponId: "NightweaversLookingGlass" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: NIGHTWEAVERS_LOOKING_GLASS_AFTER_HYDRO_OR_DENDRO_SKILL_ELEMENTAL_MASTERY }
  },
  {
    activation: "active",
    id: "weapon.nightweavers-looking-glass.after-lunar-bloom.elemental-mastery",
    label: "纺夜天镜 · 触发月绽放后的元素精通",
    source: { kind: "weapon", weaponId: "NightweaversLookingGlass" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: NIGHTWEAVERS_LOOKING_GLASS_AFTER_LUNAR_BLOOM_ELEMENTAL_MASTERY }
  },
  {
    activation: "active",
    id: "weapon.nightweavers-looking-glass.both-states.party-bloom.reaction-damage-bonus",
    label: "纺夜天镜 · 终北圣言与朔月诗篇同时存在时，队伍绽放反应伤害",
    source: { holder: "party_member", kind: "weapon", weaponId: "NightweaversLookingGlass" },
    target: "reactionDamageBonus",
    targetFilter: { reactionKinds: ["bloom"] },
    value: { kind: "refinement_table", values: NIGHTWEAVERS_LOOKING_GLASS_BLOOM_REACTION_DAMAGE_BONUS }
  },
  {
    activation: "active",
    id: "weapon.nightweavers-looking-glass.both-states.party-hyperbloom-burgeon.reaction-damage-bonus",
    label: "纺夜天镜 · 终北圣言与朔月诗篇同时存在时，队伍超绽放、烈绽放反应伤害",
    source: { holder: "party_member", kind: "weapon", weaponId: "NightweaversLookingGlass" },
    target: "reactionDamageBonus",
    targetFilter: { reactionKinds: ["hyperbloom", "burgeon"] },
    value: {
      kind: "refinement_table",
      values: NIGHTWEAVERS_LOOKING_GLASS_HYPERBLOOM_AND_BURGEON_REACTION_DAMAGE_BONUS
    }
  },
  {
    activation: "active",
    id: "weapon.nightweavers-looking-glass.both-states.party-lunar-bloom.reaction-damage-bonus",
    label: "纺夜天镜 · 两种状态共存时队伍的月绽放伤害",
    source: { holder: "party_member", kind: "weapon", weaponId: "NightweaversLookingGlass" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["lunar_bloom"] },
    value: { kind: "refinement_table", values: NIGHTWEAVERS_LOOKING_GLASS_LUNAR_BLOOM_DAMAGE_BONUS }
  }
]
