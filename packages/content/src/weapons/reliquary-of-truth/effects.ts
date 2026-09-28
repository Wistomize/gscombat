import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

const skillPreparation = prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "本人可施放战技")
const bloomDamagePreparation = prepareWeaponEffect({ kind: "special_reaction_damage", specialReactions: ["lunar_bloom"], provider: "source", recipient: "source" }, "本人有月绽放伤害动作，不能借队友触发代替")

export const RELIQUARY_OF_TRUTH_CRIT_RATE = [0.08, 0.1, 0.12, 0.14, 0.16] as const
export const RELIQUARY_OF_TRUTH_AFTER_SKILL_ELEMENTAL_MASTERY = [80, 100, 120, 140, 160] as const
export const RELIQUARY_OF_TRUTH_AFTER_LUNAR_BLOOM_CRIT_DAMAGE = [0.24, 0.3, 0.36, 0.42, 0.48] as const
export const RELIQUARY_OF_TRUTH_COMBINED_ELEMENTAL_MASTERY = [120, 150, 180, 210, 240] as const
export const RELIQUARY_OF_TRUTH_COMBINED_CRIT_DAMAGE = [0.36, 0.45, 0.54, 0.63, 0.72] as const

/** Typed automatic and selected combined-state contributions of Reliquary of Truth. */
export const reliquaryOfTruthCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.reliquary-of-truth.crit-rate",
    label: "真语秘匣 · 暴击率",
    source: { kind: "weapon", weaponId: "ReliquaryOfTruth" },
    target: "critRate",
    value: { kind: "refinement_table", values: RELIQUARY_OF_TRUTH_CRIT_RATE }
  },
  {
    activation: "automatic",
    lifecycle: skillPreparation,
    exclusivity: { group: "reliquary-of-truth-both-states", variant: "after-skill-only", automaticPriority: 1 },
    id: "weapon.reliquary-of-truth.after-skill.elemental-mastery",
    label: "真语秘匣 · 施放元素战技后的元素精通",
    source: { kind: "weapon", weaponId: "ReliquaryOfTruth" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: RELIQUARY_OF_TRUTH_AFTER_SKILL_ELEMENTAL_MASTERY }
  },
  {
    activation: "automatic",
    lifecycle: bloomDamagePreparation,
    exclusivity: { group: "reliquary-of-truth-both-states", variant: "after-lunar-bloom-only", automaticPriority: 1 },
    id: "weapon.reliquary-of-truth.after-lunar-bloom.crit-damage",
    label: "真语秘匣 · 触发月绽放后的暴击伤害",
    source: { kind: "weapon", weaponId: "ReliquaryOfTruth" },
    target: "critDamage",
    value: { kind: "refinement_table", values: RELIQUARY_OF_TRUTH_AFTER_LUNAR_BLOOM_CRIT_DAMAGE }
  },
  {
    activation: "automatic",
    lifecycle: { kind: "all_of", alternatives: [skillPreparation, bloomDamagePreparation] },
    exclusivity: { group: "reliquary-of-truth-both-states", variant: "both", automaticPriority: 2 },
    id: "weapon.reliquary-of-truth.both-states.elemental-mastery",
    label: "真语秘匣 · 两种状态共存时的元素精通",
    source: { kind: "weapon", weaponId: "ReliquaryOfTruth" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: RELIQUARY_OF_TRUTH_COMBINED_ELEMENTAL_MASTERY }
  },
  {
    activation: "automatic",
    lifecycle: { kind: "all_of", alternatives: [skillPreparation, bloomDamagePreparation] },
    exclusivity: { group: "reliquary-of-truth-both-states", variant: "both", automaticPriority: 2 },
    id: "weapon.reliquary-of-truth.both-states.crit-damage",
    label: "真语秘匣 · 两种状态共存时的暴击伤害",
    source: { kind: "weapon", weaponId: "ReliquaryOfTruth" },
    target: "critDamage",
    value: { kind: "refinement_table", values: RELIQUARY_OF_TRUTH_COMBINED_CRIT_DAMAGE }
  }
]
