import type { AdditiveReactionConfig, AmplifyingReactionConfig } from "./reaction.js"
import type { TransformativeReaction } from "./rotation.js"

export type Element = "anemo" | "cryo" | "dendro" | "electro" | "geo" | "hydro" | "physical" | "pyro"

export type ScalingStat = "attack" | "defense" | "elementalMastery" | "hp"

/** Damage families that use the independent Moon or stellar formula instead of ordinary direct damage stages. */
export type SpecialReactionKind = "lunar_bloom" | "lunar_charged" | "lunar_crystallize" | "stellar_superconduct"

export interface DamageTags {
  readonly actionId: string
  readonly element: Element
  readonly ownerId: string
  readonly talent: "burst" | "normal" | "passive" | "plunge" | "skill"
}

/** One base-scaling contribution that belongs to a single damage hit. */
export interface DamageScalingTerm {
  readonly coefficient: number
  /** Optional source label for an externally supplied term that joins this same hit. */
  readonly label?: string
  readonly stat: ScalingStat
}

interface DamageActionBase {
  readonly additiveReaction?: AdditiveReactionConfig
  readonly amplifyingReaction?: AmplifyingReactionConfig
  readonly canCrit: boolean
  /** Overrides normal crit-rate expectation when an independent event is guaranteed to crit by its trigger. */
  readonly critPolicy?: "guaranteed"
  readonly tags: DamageTags
}

/** A legacy one-stat damage action. */
export interface SingleScalingDamageAction extends DamageActionBase {
  readonly multiplier: number
  /** Defaults to attack so existing declared direct actions retain their original calculation. */
  readonly scalingStat?: ScalingStat
  readonly scalingTerms?: never
}

/** A single hit whose base damage is the sum of two or more explicitly declared scaling terms. */
export interface MultiScalingDamageAction extends DamageActionBase {
  readonly multiplier?: never
  readonly scalingStat?: never
  readonly scalingTerms: readonly [DamageScalingTerm, ...DamageScalingTerm[]]
}

export type DamageAction = SingleScalingDamageAction | MultiScalingDamageAction

export interface CombatStats {
  readonly attackPercent: number
  readonly baseAttack: number
  readonly critDamage: number
  readonly critRate: number
  readonly damageBonus: number
  readonly defense?: number
  readonly elementalMastery: number
  readonly flatAttack: number
  readonly hp?: number
  readonly level: number
}

export interface EnemyStats {
  readonly defenseReduction: number
  readonly level: number
  readonly resistance: number
}

export interface DamageFilter {
  readonly actionId?: string
  readonly element?: Element
  readonly ownerId?: string
  readonly talent?: DamageTags["talent"]
}

interface SourcedModifier {
  readonly source: string
  readonly value: number
}

export interface AttackFlatModifier extends SourcedModifier {
  readonly kind: "attack_flat"
}

export interface AttackPercentModifier extends SourcedModifier {
  readonly kind: "attack_percent"
}

export interface TalentMultiplierModifier extends SourcedModifier {
  readonly filter: DamageFilter
  readonly kind: "talent_multiplier_bonus"
}

export interface DamageBonusModifier extends SourcedModifier {
  readonly filter: DamageFilter
  readonly kind: "damage_bonus"
}

export interface BaseDamageFlatModifier extends SourcedModifier {
  readonly filter: DamageFilter
  readonly kind: "base_damage_flat"
}

export interface DefenseIgnoreModifier extends SourcedModifier {
  readonly filter: DamageFilter
  readonly kind: "defense_ignore"
}

export interface ResistanceReductionModifier extends SourcedModifier {
  readonly element: Element
  readonly kind: "resistance_reduction"
}

export type Modifier =
  | AttackFlatModifier
  | AttackPercentModifier
  | BaseDamageFlatModifier
  | DamageBonusModifier
  | DefenseIgnoreModifier
  | ResistanceReductionModifier
  | TalentMultiplierModifier

export type DamageStage =
  | "attack"
  | "scaling"
  | "talent"
  | "amplifying_reaction"
  | "additive_reaction"
  | "transformative_reaction"
  | "damage_bonus"
  | "crit"
  | "defense"
  | "resistance"
  | "base_damage"
  | "reaction_coefficient"
  | "base_damage_bonus"
  | "reaction_damage_bonus"
  | "big_power"
  | "flat_damage_addition"
  | "ascension"

/** Stages unique to the independent Moon and stellar damage formula. */
export type SpecialReactionTraceStage = Extract<
  DamageStage,
  | "base_damage"
  | "reaction_coefficient"
  | "base_damage_bonus"
  | "reaction_damage_bonus"
  | "big_power"
  | "flat_damage_addition"
  | "crit"
  | "resistance"
  | "ascension"
>

export type TraceFormula =
  | {
      readonly attackPercent: number
      readonly baseAttack: number
      readonly flatAttack: number
      readonly kind: "attack"
    }
  | { readonly kind: "scaling"; readonly stat: Exclude<ScalingStat, "attack">; readonly value: number }
  | {
      readonly kind: "scaling_terms"
      readonly terms: (DamageScalingTerm & { readonly contribution: number; readonly value: number })[]
    }
  | { readonly kind: "talent"; readonly multiplier: number }
  | { readonly flatDamageAddition: number; readonly kind: "direct_flat_damage_addition" }
  | {
      readonly baseMultiplier: number
      readonly bonus: number
      readonly elementalMastery: number
      readonly kind: "amplifying_reaction"
      readonly multiplier: number
      readonly reaction: AmplifyingReactionConfig["kind"]
    }
  | {
      readonly baseDamage: number
      readonly bonus: number
      readonly elementalMastery: number
      readonly kind: "additive_reaction"
      readonly multiplier: number
      readonly reaction: AdditiveReactionConfig["kind"]
      readonly reactionDamage: number
    }
  | {
      readonly baseDamage: number
      readonly bonus: number
      readonly elementalMastery: number
      readonly kind: "transformative_reaction"
      readonly multiplier: number
      readonly reaction: TransformativeReaction
    }
  | { readonly bonus: number; readonly kind: "damage_bonus"; readonly multiplier: number }
  | {
      readonly critDamage: number
      readonly critRate: number
      readonly kind: "expected_crit"
      readonly multiplier: number
    }
  | {
      readonly attackerLevel: number
      readonly defenseIgnore: number
      readonly defenseReduction: number
      readonly enemyLevel: number
      readonly kind: "defense"
      readonly multiplier: number
    }
  | {
      readonly effectiveResistance: number
      readonly kind: "resistance"
      readonly multiplier: number
      readonly resistance: number
      readonly resistanceReduction: number
    }
  | { readonly kind: "special_reaction_base_damage"; readonly value: number }
  | {
      readonly kind: "special_reaction_coefficient"
      readonly multiplier: number
      readonly reactionKind: SpecialReactionKind
      readonly storedElementalApplications?: number
    }
  | { readonly bonus: number; readonly kind: "special_reaction_base_damage_bonus"; readonly multiplier: number }
  | {
      readonly bonus: number
      readonly elementalMastery: number
      readonly kind: "special_reaction_damage_bonus"
      readonly masteryBonus: number
      readonly multiplier: number
    }
  | { readonly kind: "special_reaction_big_power"; readonly multiplier: number }
  | { readonly flatDamageAddition: number; readonly kind: "special_reaction_flat_damage_addition" }
  | { readonly ascensionBonus: number; readonly kind: "special_reaction_ascension"; readonly multiplier: number }

/** The subset of trace formulas emitted by the independent Moon and stellar calculator. */
export type SpecialReactionTraceFormula = Extract<
  TraceFormula,
  | { readonly kind: "special_reaction_base_damage" }
  | { readonly kind: "special_reaction_coefficient" }
  | { readonly kind: "special_reaction_base_damage_bonus" }
  | { readonly kind: "special_reaction_damage_bonus" }
  | { readonly kind: "special_reaction_big_power" }
  | { readonly kind: "special_reaction_flat_damage_addition" }
  | { readonly kind: "expected_crit" }
  | { readonly kind: "resistance" }
  | { readonly kind: "special_reaction_ascension" }
>

export interface TraceEntry {
  readonly after: number
  readonly before: number
  readonly formula: TraceFormula
  readonly source: string
  readonly stage: DamageStage
}

export interface ExpectedDamageInput {
  readonly action: DamageAction
  readonly enemy: EnemyStats
  readonly modifiers: readonly Modifier[]
  readonly stats: CombatStats
}

export interface ExpectedDamageResult {
  readonly critDamage: number
  readonly expectedDamage: number
  readonly nonCritDamage: number
  readonly trace: readonly TraceEntry[]
}
