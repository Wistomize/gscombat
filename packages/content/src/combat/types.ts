import type {
  AdditiveReactionConfig,
  AmplifyingReactionConfig,
  DirectSpecialReactionKind,
  Element,
  RotationElementalApplication,
  RotationElementOverrideTarget,
  ScalingStat,
  TransformativeReaction
} from "@gscombat/calculator"
import type { TravelerElement } from "@gscombat/contracts"

import type { CatalogWeaponType } from "../catalog-presentation.js"

/** Declares how much of a character or action has executable, maintained battle logic. */
export type CombatCoverageStatus = "unsupported" | "draft" | "verified"

/** Identifies the talent area that owns a future rotation action. */
export type CombatTalentSlot = "normal" | "plunge" | "skill" | "burst" | "passive" | "constellation"

/** Identifies a levelled combat table or a fixed-level passive table in the immutable data snapshot. */
export type CombatTalentParameterGroupId =
  | "auto"
  | "burst"
  | "lockedPassive"
  | "passive"
  | "passive1"
  | "passive2"
  | "passive3"
  | "skill"
  | "sprint"

/** Identifies how a metric parameter resolves its value from the source build. */
export type CombatTalentParameterSlot = "normal" | "skill" | "burst" | "passive"

/** Separates damage events from non-damage support actions. */
export type CombatActionKind = "damage" | "support"

/** Describes the base damage family before reaction-specific resolution is applied. */
export type CombatDamageKind = "direct" | "special_reaction" | "transformative"

/** Selects the calculation path that turns this content declaration into damage events. */
export type CombatActionEvaluator =
  | "declared_direct"
  | "declared_special_reaction"
  | "declared_transformative"
  | "special"

/** One explicit single-event transformative reaction used as a standalone character metric. */
export interface CombatTransformativeReactionConfig {
  /** Required for Swirl because the resulting damage element is not determined by the reaction kind alone. */
  readonly damageElement?: "cryo" | "electro" | "hydro" | "pyro"
  readonly kind: TransformativeReaction
}

/**
 * Declares one character action that is explicitly treated as Moon or stellar reaction damage.
 * Reaction participant selection and elemental-application timing are intentionally not inferred here.
 */
export interface CombatDirectSpecialReactionConfig {
  /** Additive ratio in the special-reaction base-damage-bonus stage. */
  readonly baseDamageBonus?: number
  /** Additive direct special-reaction fixed damage after reaction multipliers and before CRIT. */
  readonly flatDamageAddition?: number
  readonly kind: DirectSpecialReactionKind
  /** Additive ratio in the special-reaction reaction-damage-bonus stage. */
  readonly reactionDamageBonus?: number
  /** Additive ratio in the final special-reaction ascension stage. */
  readonly ascensionBonus?: number
  /**
   * Required only for Stellar-Superconduct. This references an action-owned manual current-window
   * snapshot; it is never derived from a full rotation or automatic timing simulation.
   */
  readonly stellarStoredElementalApplicationsParameterId?: string
}

/** Ordinary reaction kinds that may receive a reaction-specific bonus without touching normal damage bonuses. */
export type CombatActionReactionKind = AdditiveReactionConfig["kind"] | TransformativeReaction

/** Locks one reviewed talent coefficient to its value in the immutable game-data snapshot. */
export interface CombatTalentCoefficientSnapshotCheck {
  readonly expectedCoefficient: number
  readonly talentLevel: number
}

/** One stat-specific coefficient that contributes to a single declared damage hit. */
export interface CombatDamageScalingTerm {
  /** Optionally multiplies this term by another talent parameter, such as a burst stat-conversion ratio. */
  readonly coefficientMultiplierParameterId?: string
  /** Locks the optional multiplier parameter to its reviewed values in the immutable snapshot. */
  readonly coefficientMultiplierSnapshotChecks?: readonly CombatTalentCoefficientSnapshotCheck[]
  /** Multiplies this one stat term by a bounded action-owned integer such as a currently selected stack count. */
  readonly coefficientMultiplierScenarioParameterId?: string
  /** Converts the integer scenario value into the ratio used by this coefficient, such as percent to decimal. */
  readonly coefficientMultiplierScenarioParameterScale?: number
  readonly coefficientParameterId: string
  /** Keeps an ascension passive term out of the base damage until the source reaches the required ascension. */
  readonly minimumSourceAscension?: number
  readonly snapshotChecks?: readonly CombatTalentCoefficientSnapshotCheck[]
  readonly stat: ScalingStat
}

/** Resolves a bounded action snapshot value into a multiplier for one action-owned effect. */
export interface CombatActionScenarioParameterLookupMultiplier {
  readonly parameterId: string
  readonly values: readonly {
    readonly multiplier: number
    readonly parameterValue: number
  }[]
}

/** Resolves a bounded action snapshot value through a non-negative affine multiplier. */
export interface CombatActionScenarioParameterLinearMultiplier {
  readonly base: number
  readonly parameterId: string
  readonly perParameterValue: number
}

/** Resolves a bounded action snapshot into an intrinsic-effect multiplier. */
export type CombatActionScenarioParameterMultiplier =
  | CombatActionScenarioParameterLinearMultiplier
  | CombatActionScenarioParameterLookupMultiplier

/** Identifies the explicit calculation stage that receives one action-owned intrinsic effect. */
export type CombatActionIntrinsicEffectTarget = "critRate" | "damageBonus" | "elementalMastery"

/** Shared source and gating fields for a bounded action-owned intrinsic effect. */
interface CombatActionIntrinsicEffectBase {
  /** Player-facing source name used by the auditable stat ledger. */
  readonly label?: string
  /** Keeps an ascension passive out of the result until the source character reaches the required ascension. */
  readonly minimumSourceAscension?: number
  /** Applies one selected bounded action snapshot after the source value has been resolved. */
  readonly scenarioParameterMultiplier?: CombatActionScenarioParameterMultiplier
  readonly target: CombatActionIntrinsicEffectTarget
}

/** Adds one fixed or passive-table value directly to an explicit action calculation stage. */
export interface CombatActionFlatIntrinsicEffect extends CombatActionIntrinsicEffectBase {
  readonly coefficientParameterId?: string
  readonly fixedValue?: number
  readonly kind: "flat"
  readonly snapshotChecks?: readonly CombatTalentCoefficientSnapshotCheck[]
  /** Converts a source-table value into the unit consumed by the target stage. */
  readonly valueMultiplier?: number
}

/** Derives an action-owned effect from one current source stat with reviewed thresholds and caps. */
export interface CombatActionSourceStatIntrinsicEffect extends Omit<CombatActionIntrinsicEffectBase, "target"> {
  readonly coefficientParameterId: string
  readonly kind: "source_stat"
  /** Caps the final effect value with one reviewed static value after source-stat scaling. */
  readonly maximumValue?: number
  /** Caps the final effect value after source-stat scaling. */
  readonly maximumValueParameterId?: string
  readonly maximumValueSnapshotChecks?: readonly CombatTalentCoefficientSnapshotCheck[]
  /** Floors the source stat before applying the source-stat cap and coefficient. */
  readonly sourceStatOffsetParameterId?: string
  readonly sourceStatOffsetSnapshotChecks?: readonly CombatTalentCoefficientSnapshotCheck[]
  /** Caps the eligible source-stat amount before its coefficient is applied. */
  readonly sourceStatMaximumParameterId?: string
  readonly sourceStatMaximumSnapshotChecks?: readonly CombatTalentCoefficientSnapshotCheck[]
  readonly sourceStat: ScalingStat
  readonly snapshotChecks?: readonly CombatTalentCoefficientSnapshotCheck[]
  readonly target: Exclude<CombatActionIntrinsicEffectTarget, "elementalMastery">
  /** Converts a source-table value into the unit consumed by the target stage. */
  readonly valueMultiplier?: number
}

/** One action-owned contribution applied only at its declared calculation stage. */
export type CombatActionIntrinsicEffect = CombatActionFlatIntrinsicEffect | CombatActionSourceStatIntrinsicEffect

/** Adds a capped source-stat conversion to attack before an action resolves its damage coefficient. */
export interface CombatActionCappedStatToAttackConversion {
  readonly capRatioParameterId: string
  readonly capRatioSnapshotChecks?: readonly CombatTalentCoefficientSnapshotCheck[]
  readonly ratioParameterId: string
  readonly ratioSnapshotChecks?: readonly CombatTalentCoefficientSnapshotCheck[]
  readonly scalingStat: "hp" | "defense" | "elementalMastery"
}

/** A legacy one-stat hit group inside a declared direct action. */
export interface SingleScalingCombatDamagePart {
  readonly coefficientParameterId: string
  readonly id: string
  readonly snapshotChecks?: readonly CombatTalentCoefficientSnapshotCheck[]
  readonly scalingTerms?: never
}

/** A single hit with multiple base scaling contributions before its shared damage multipliers. */
export interface MultiScalingCombatDamagePart {
  readonly coefficientParameterId?: never
  readonly id: string
  readonly scalingTerms: readonly [CombatDamageScalingTerm, ...CombatDamageScalingTerm[]]
  readonly snapshotChecks?: never
}

/** One named hit group inside a declared direct action. */
export type CombatDamagePart = SingleScalingCombatDamagePart | MultiScalingCombatDamagePart

/** Selects when a damage event reads its currently supported resolved stat snapshot. */
export type CombatEventSnapshot = "cast" | "hit" | "time"

/** Declares a constellation-specific valid range for one bounded action snapshot input. */
export interface CombatActionIntegerScenarioParameterConstellationRange {
  /** The default used when the caller does not supply a manual value at this constellation or higher. */
  readonly defaultValue?: number
  /** The highest valid value while the relevant source-owned state is active. */
  readonly maximumValue?: number
  readonly minimumSourceConstellation: number
  /** The lowest valid value while the relevant source-owned state is active. */
  readonly minimumValue?: number
}

/** One bounded integer choice that changes a declared action without introducing arbitrary evaluator code. */
export interface CombatActionIntegerScenarioParameter {
  /** Optional finite set when a snapshot input has meaningful values outside a continuous integer range. */
  readonly allowedValues?: readonly number[]
  readonly defaultValue: number
  readonly id: string
  readonly label: string
  readonly maximumValue: number
  /** Limits an otherwise valid snapshot value to one source-constellation threshold. */
  readonly minimumSourceConstellationByValue?: readonly {
    readonly minimumSourceConstellation: number
    readonly value: number
  }[]
  /** Optionally tightens the allowed maximum from another parameter in the same action. */
  readonly maximumValueByParameter?: {
    readonly parameterId: string
    readonly values: readonly {
      readonly maximumValue: number
      readonly parameterValue: number
    }[]
  }
  readonly minimumValue: number
  /** Overrides the manual-state range and default when the source build reaches a constellation threshold. */
  readonly rangeBySourceConstellation?: readonly CombatActionIntegerScenarioParameterConstellationRange[]
}

/** Resolves an event's total hit count from a constant or one declared integer action parameter. */
export type CombatEventHitCount =
  | number
  | {
      readonly kind: "scenario_parameter"
      readonly parameterId: string
    }

/** Resolves a coefficient multiplier from one declared integer action parameter. */
export interface CombatEventScenarioParameterLookupMultiplier {
  readonly kind: "scenario_parameter_lookup"
  readonly parameterId: string
  readonly values: readonly {
    readonly multiplier: number
    readonly parameterValue: number
  }[]
}

/** Resolves an event multiplier as base plus one bounded action parameter times a talent coefficient. */
export interface CombatEventScenarioParameterTalentLinearMultiplier {
  readonly base: number
  readonly kind: "scenario_parameter_talent_linear"
  readonly parameterId: string
  readonly perParameterTalentCoefficientId: string
  readonly perParameterTalentCoefficientSnapshotChecks?: readonly CombatTalentCoefficientSnapshotCheck[]
}

/** Resolves a whole event multiplier from a declared bounded action parameter. */
export type CombatEventScenarioParameterCoefficientMultiplier =
  | CombatEventScenarioParameterLookupMultiplier
  | CombatEventScenarioParameterTalentLinearMultiplier

/** Shared timing and damage-part fields for one scheduled damage event. */
interface CombatDamageEventTemplateBase {
  readonly at: number
  /** Optional bounded multiplier applied before the damage formula is evaluated. */
  readonly coefficientMultiplier?: CombatEventScenarioParameterCoefficientMultiplier
  readonly damagePartId: string
  /** Optional event-level element application; reactions are derived from the declared scenario aura. */
  readonly elementalApplication?: RotationElementalApplication
  /** Allows a physical normal-attack event to receive an explicit elemental override window. */
  readonly elementOverrideTarget?: RotationElementOverrideTarget
  /** Represents repeated identical hits after all action-specific constraints have been resolved. */
  readonly hitCount?: CombatEventHitCount
  readonly id: string
  /**
   * Resolves this one event with the independent Moon or Stellar direct-reaction formula.
   * Such an event does not consume or derive an ordinary elemental aura, and cannot receive an elemental override.
   */
  readonly specialReaction?: CombatDirectSpecialReactionConfig
}

/** Binds one scheduled damage event to its action cast-time stat snapshot. */
export interface CombatCastDamageEventTemplate extends CombatDamageEventTemplateBase {
  readonly snapshot: "cast"
  readonly snapshotAt?: never
}

/** Binds one scheduled damage event to its own hit-time stat snapshot. */
export interface CombatHitDamageEventTemplate extends CombatDamageEventTemplateBase {
  readonly snapshot: "hit"
  readonly snapshotAt?: never
}

/** Binds one scheduled damage event to an explicit action-relative stat snapshot time. */
export interface CombatTimedDamageEventTemplate extends CombatDamageEventTemplateBase {
  readonly snapshot: "time"
  readonly snapshotAt: number
}

/** Binds one scheduled damage event to a declared damage part and stat snapshot policy. */
export type CombatDamageEventTemplate =
  | CombatCastDamageEventTemplate
  | CombatHitDamageEventTemplate
  | CombatTimedDamageEventTemplate

/** Defines the ordered damage-event timing for one action relative to its cast. */
export interface CombatActionTimeline {
  readonly damageEvents: readonly [CombatDamageEventTemplate, ...CombatDamageEventTemplate[]]
  readonly duration: number
}

/** Content-owned presentation for an aggregate action whose formula should focus on one representative event. */
export interface CombatActionTracePresentation {
  readonly focusEventId: string
  readonly focusLabel: string
  readonly totalLabel: string
}

/** References a value in the versioned snapshot instead of copying a talent coefficient into content code. */
export type CombatParameterReference =
  | {
      readonly groupId: CombatTalentParameterGroupId
      readonly id: string
      readonly parameterIndex: number
      readonly source: "talent"
      readonly talentSlot: CombatTalentParameterSlot
    }
  | {
      readonly groupId: string
      readonly id: string
      readonly path: readonly number[]
      readonly source: "raw"
    }

/** A talent-backed parameter reference reused by a maintained combat effect. */
export type CombatTalentParameterReference = Extract<CombatParameterReference, { readonly source: "talent" }>

/** Locks a reviewed non-damage talent parameter to its value in the immutable game-data snapshot. */
export interface CombatTalentParameterSnapshotCheck {
  readonly expectedValue: number
  readonly talentLevel: number
}

/** References one talent-table value used by a character-owned analysis metric. */
export interface CombatMetricTalentParameter {
  readonly reference: CombatTalentParameterReference
  readonly snapshotChecks: readonly CombatTalentParameterSnapshotCheck[]
  /** Applies a post-lookup unit conversion while preserving raw snapshot verification. */
  readonly valueMultiplier?: number
}

/** Reads one bounded, source-action-owned integer snapshot as a scalar metric's ratio multiplier. */
export interface CombatMetricRatioScenarioParameter {
  readonly parameterId: string
}

/** Adds a direct ratio contribution to a stat-buff metric when the source constellation is active. */
export interface CombatMetricRatioConstellationBonus {
  readonly minimumConstellation: number
  readonly value: number
}

/** Identifies the current character's primary output category without converting it into another role's result. */
export type CombatMetricKind = "damage" | "healing" | "scalar" | "stat_buff"

/** Identifies the entity that receives the metric's evaluated result. */
export type CombatMetricTargetKind = "enemy" | "friendly_recipient" | "self"

/** Requires the selected friendly recipient to be in the source effect's applicable area. */
export interface CombatMetricRecipientInSourceAreaRequirement {
  readonly kind: "recipient_in_source_area"
  readonly label: string
}

/** Requires the selected friendly recipient's current HP fraction to pass a declared comparison. */
export interface CombatMetricRecipientHpFractionRequirement {
  readonly comparison: "at_most" | "above"
  readonly kind: "recipient_hp_fraction"
  readonly label: string
  readonly threshold: number
  /** Allows a source constellation to remove this condition without inventing a fixed target build. */
  readonly waivedAtSourceConstellation?: number
}

/** Requires the source character's current HP fraction to pass a declared comparison. */
export interface CombatMetricSourceHpFractionRequirement {
  readonly comparison: "at_most" | "above"
  readonly kind: "source_hp_fraction"
  readonly label: string
  readonly threshold: number
}

/** One target-side condition that a maintainer can attach to a friendly-recipient metric. */
export type CombatMetricRecipientRequirement =
  | CombatMetricRecipientHpFractionRequirement
  | CombatMetricRecipientInSourceAreaRequirement

/** Selects a source stat that a metric may read from the configured source character build. */
export type CombatMetricScalingStat = "attack" | "base_attack" | "defense" | "elementalMastery" | "hp"

/** Describes what a standalone scalar metric means without converting it into another character's damage. */
export type CombatScalarMetricSemantic =
  | "attack_buff"
  | "attack_speed_bonus"
  | "bloom_related_reaction_damage_bonus"
  | "bloom_related_reaction_flat_damage_addition"
  | "damage_bonus"
  | "defense_buff"
  | "elemental_flat_damage_bonus"
  | "elemental_normal_attack_damage_bonus"
  | "elemental_mastery_buff"
  | "geo_damage_flat_bonus"
  | "lunar_bloom_flat_damage_bonus"
  | "lunar_crystallize_base_damage_bonus"
  | "lunar_crystallize_flat_damage_bonus"
  | "normal_attack_flat_damage_bonus"
  | "normal_and_charged_attack_damage_bonus"
  | "resistance_reduction"
  | "shield"
  | "trigger_probability"

/** Keeps unlike scalar outputs in their own units instead of merging them into a score. */
export type CombatScalarMetricUnit = "attack" | "damage" | "defense" | "elemental_mastery" | "hp" | "ratio"

/** Identifies the recipient damage categories that one flat elemental-damage contribution may augment. */
export type CombatDamageBonusAttackType = "normal" | "charged" | "plunge" | "skill" | "burst"

/** A source-owned metric declaration whose recipient is bound only at evaluation time. */
interface CombatMetricDefinitionBase {
  readonly characterId: string
  readonly id: string
  readonly label: string
  readonly sourceActionId: string
  readonly status: CombatCoverageStatus
}

/** Shared declaration fields for outputs delivered to one explicitly selected friendly recipient. */
interface CombatFriendlyRecipientMetricDefinitionBase extends CombatMetricDefinitionBase {
  readonly recipientRequirements: readonly CombatMetricRecipientRequirement[]
  readonly target: "friendly_recipient"
}

/** Reuses one declared action as a main damage character's selected expected-damage metric. */
export interface CombatDamageMetricDefinition extends CombatMetricDefinitionBase {
  readonly actionId: string
  readonly kind: "damage"
  readonly target: "enemy"
}

/** Calculates one selected recipient's healing from source scaling and recipient-side context. */
export interface CombatScaledHealingMetricDefinition extends CombatFriendlyRecipientMetricDefinitionBase {
  /** Additional source-stat healing terms that join the base percentage and flat healing before healing bonuses. */
  readonly additionalScalingTerms?: readonly CombatHealingAdditionalScalingTerm[]
  /** Conditional source-stat healing terms that join the base healing before healing-bonus multipliers. */
  readonly conditionalScalingBonuses?: readonly CombatHealingConditionalScalingBonus[]
  readonly flat?: number
  readonly flatParameter?: CombatMetricTalentParameter
  readonly includeHealingBonus: boolean
  readonly kind: "healing"
  readonly percentageParameter: CombatMetricTalentParameter
  readonly scalingStat: Exclude<CombatMetricScalingStat, "base_attack">
  /** Fixed healing modifiers granted by the source character kit, separate from build-derived healing bonus. */
  readonly sourceHealingBonuses?: readonly CombatHealingSourceBonus[]
}

/** Adds one source-stat healing contribution unlocked at a declared source ascension. */
export interface CombatHealingAdditionalScalingTerm {
  readonly label: string
  readonly minimumSourceAscension?: number
  readonly ratio: number
  readonly scalingStat: Exclude<CombatMetricScalingStat, "base_attack">
}

/** Adds one fixed source healing-bonus modifier from a character kit before recipient-side modifiers. */
export interface CombatHealingSourceBonus {
  readonly label: string
  readonly minimumSourceAscension?: number
  readonly sourceRequirement?: CombatMetricSourceHpFractionRequirement
  readonly value: number
}

/** Adds one source-stat-scaled healing term only when its source and recipient conditions are met. */
export interface CombatHealingConditionalScalingBonus {
  readonly label: string
  readonly minimumSourceConstellation: number
  readonly ratio: number
  readonly recipientRequirement: CombatMetricRecipientHpFractionRequirement
}

/** Calculates a flat stat contribution delivered to one selected friendly recipient. */
export interface CombatFlatStatBuffMetricDefinition extends CombatFriendlyRecipientMetricDefinitionBase {
  readonly affectedStat: "attack_flat"
  readonly kind: "stat_buff"
  readonly ratioConstellationBonuses?: readonly CombatMetricRatioConstellationBonus[]
  readonly ratioParameter: CombatMetricTalentParameter
  readonly scalingStat: CombatMetricScalingStat
}

/** Shared fields for a source-stat-scaled value with an optional flat contribution and cap. */
interface CombatScalarMetricDefinitionBase extends CombatMetricDefinitionBase {
  /** Required for elemental flat-damage outputs; names the element the recipient must deal. */
  readonly affectedElement?: Exclude<Element, "physical">
  /** Required for scoped damage outputs; names the recipient hit classes that may consume the effect. */
  readonly appliesTo?: readonly CombatDamageBonusAttackType[]
  readonly flat?: number
  readonly flatParameter?: CombatMetricTalentParameter
  readonly kind: "scalar"
  readonly maximumValue?: number
  /** Resolves a talent-level-aware cap instead of freezing a number from one level. */
  readonly maximumValueParameter?: CombatMetricTalentParameter
  /** Keeps an ascension passive out of the metric result until the source reaches the required ascension. */
  readonly minimumSourceAscension?: number
  readonly minimumScalingValue?: number
  readonly ratio?: number
  readonly ratioParameter?: CombatMetricTalentParameter
  /** Multiplies the ratio by one explicitly hand-filled snapshot from this metric's source action. */
  readonly ratioScenarioParameter?: CombatMetricRatioScenarioParameter
  readonly scalingStat?: CombatMetricScalingStat
  readonly semantic: CombatScalarMetricSemantic
  readonly unit: CombatScalarMetricUnit
}

/** A scalar source output delivered to one explicitly selected friendly character. */
export interface CombatFriendlyScalarMetricDefinition
  extends CombatScalarMetricDefinitionBase,
    CombatFriendlyRecipientMetricDefinitionBase {
  /** Routes an active-character effect back to the source when the active recipient lacks Moonsign. */
  readonly recipientTargetRouting?: "active_recipient_if_moonsign_else_self"
  readonly target: "friendly_recipient"
}

/** A scalar source output applied directly to the configured enemy. */
export interface CombatEnemyScalarMetricDefinition extends CombatScalarMetricDefinitionBase {
  readonly target: "enemy"
}

/** A scalar source output that applies only to the configured source character. */
export interface CombatSelfScalarMetricDefinition extends CombatScalarMetricDefinitionBase {
  readonly target: "self"
}

/** A formula-traced scalar output whose meaning and unit remain explicit. */
export type CombatScalarMetricDefinition =
  | CombatEnemyScalarMetricDefinition
  | CombatFriendlyScalarMetricDefinition
  | CombatSelfScalarMetricDefinition

/** One maintained, character-owned analysis output. Different units are intentionally never merged into a score. */
export type CombatMetricDefinition =
  | CombatDamageMetricDefinition
  | CombatFlatStatBuffMetricDefinition
  | CombatScalarMetricDefinition
  | CombatScaledHealingMetricDefinition

/** The melee weapon families that can receive the currently modeled normal-attack infusions. */
export type CombatMeleeWeaponType = "claymore" | "polearm" | "sword"

/** Identifies a weapon-hit category that can differ from the talent table used by an action. */
export type CombatAttackKind = "charged" | "normal" | "plunge"

/** A stat stage owned by an automatic equipment passive or an explicitly selected current-action state. */
export type CombatActionEffectTarget =
  | "additionalDamageEvent"
  /** Adds to character plus weapon Base ATK before every ATK% multiplier. */
  | "baseAttackFlat"
  | "baseDamageFlat"
  | "matchedActionAdditiveDamageTerm"
  | "attackPercent"
  /** Adds a bounded integer to one declared action snapshot parameter before its coefficient is resolved. */
  | "actionParameter"
  | "flatAttack"
  | "critDamage"
  | "critRate"
  | "damageBonus"
  /** Adds to the configured multiplier bonus of an eligible Vaporize or Melt action. */
  | "amplifyingReactionBonus"
  /** Adds only to an eligible Aggravate, Spread, or transformative-reaction formula. */
  | "reactionDamageBonus"
  /** Adds after an eligible transformative reaction's level, multiplier, and reaction-bonus calculation, before resistance. */
  | "transformativeReactionFlatDamageAddition"
  /** Adds only to an eligible direct Moon or Stellar reaction's dedicated reaction-damage-bonus stage. */
  | "specialReactionDamageBonus"
  /** Adds directly to an eligible Moon or Stellar action's base damage before every special-reaction multiplier. */
  | "specialReactionBaseDamageFlat"
  /** Adds to an eligible Moon or Stellar action's independent base-damage-bonus stage. */
  | "specialReactionBaseDamageBonus"
  /** Adds after the independent Moon or Stellar reaction multipliers, before critical expectation. */
  | "specialReactionFlatDamageAddition"
  /** Adds to an eligible Moon or Stellar action's final damage-elevation stage. */
  | "specialReactionElevation"
  | "defenseFlat"
  | "defensePercent"
  | "enemyDefenseIgnore"
  | "enemyDefenseReduction"
  | "energyRecharge"
  | "elementalMastery"
  | "enemyResistanceReduction"
  | "hpFlat"
  | "hpPercent"
  /** A self-owned conversion applied only after the primary build's final maximum HP is resolved. */
  | "finalHpToFlatAttack"
  /** A self-owned conversion applied only after the primary build's final maximum HP is resolved. */
  | "finalHpToElementalMastery"
  /** A self-owned conversion applied after all selected elemental-mastery effects have been resolved. */
  | "finalElementalMasteryToFlatAttack"
  /** A self-owned conversion applied only after final maximum HP is resolved. */
  | "finalHpToDamageBonus"
  /** A self-owned conversion applied only after final maximum HP is known, limited to the holder's native element. */
  | "finalHpToOwnElementDamageBonus"
  /** Converts the selected effect source's final maximum HP into the recipient's elemental mastery. */
  | "sourceFinalHpToElementalMastery"
  /** Converts the selected effect source's final elemental mastery into the recipient's flat attack. */
  | "sourceFinalElementalMasteryToFlatAttack"
  /** Converts the selected effect source's final elemental mastery into the recipient's energy recharge. */
  | "sourceFinalElementalMasteryToEnergyRecharge"
  /** Converts the selected effect source's final defense into the recipient's elemental damage bonus. */
  | "sourceFinalDefenseToDamageBonus"
  /** Converts the selected effect source's final attack into the recipient's damage bonus. */
  | "sourceFinalAttackToDamageBonus"

/** Narrows one action effect to the damage actions where its wording is applicable. */
export interface CombatActionEffectTargetFilter {
  /** Narrows an effect to one or more declared core-action IDs. */
  readonly actionIds?: readonly string[]
  /** Narrows an effect to actions owned by one or more current recipient characters. */
  readonly recipientCharacterIds?: readonly string[]
  /** Requires the selected action's recipient to be a current Hexerei character. */
  readonly recipientHexereiRequired?: true
  /** Excludes declared actions that cannot receive an otherwise matching current-action effect. */
  readonly excludedActionIds?: readonly string[]
  /** Requires the selected action's recipient build to be the same as, or different from, the effect source build. */
  readonly recipientSourceRelation?: "not_source" | "source"
  /** Narrows an effect to recipient builds equipped with one of these weapon categories. */
  readonly recipientWeaponTypes?: readonly CatalogWeaponType[]
  /** Narrows an effect to explicit normal, charged, or plunge weapon hits. */
  readonly attackKinds?: readonly CombatAttackKind[]
  /** Narrows an effect to actions whose declared Vaporize or Melt configuration matches one of these kinds. */
  readonly amplifyingReactionKinds?: readonly AmplifyingReactionConfig["kind"][]
  /** Narrows an effect to ordinary Additive or transformative reaction metrics, excluding Vaporize and Melt. */
  readonly reactionKinds?: readonly CombatActionReactionKind[]
  /** Narrows an effect to one or more direct Moon or Stellar-reaction metrics. */
  readonly specialReactionKinds?: readonly DirectSpecialReactionKind[]
  readonly elements?: readonly Element[]
  readonly talentSlots?: readonly CombatTalentSlot[]
}

/** A bounded enemy-count condition that can be derived from the selected scenario. */
export interface CombatActionEffectEnemyCountCondition {
  readonly kind: "enemy_count"
  readonly maximum?: number
  readonly minimum?: number
}

/** A static party composition condition derived from the configured primary build and teammates. */
export interface CombatActionEffectTeamUniqueElementCountCondition {
  readonly kind: "team_unique_element_count"
  readonly minimum: number
}

/** Counts party members whose configured element belongs to one declared set. */
export interface CombatActionEffectTeamElementCountCondition {
  readonly elements: readonly Exclude<Element, "physical">[]
  readonly kind: "team_element_count"
  readonly maximum?: number
  readonly minimum: number
}

/** Requires the resolved effect source to be able or unable to enter Nightsoul's Blessing. */
export interface CombatActionEffectSourceNightsoulBlessingCondition {
  readonly kind: "source_nightsoul_blessing"
  readonly required: boolean
}

/** Requires the evaluated primary build to be able or unable to enter Nightsoul's Blessing. */
export interface CombatActionEffectPrimaryNightsoulBlessingCondition {
  readonly kind: "primary_nightsoul_blessing"
  readonly required: boolean
}

/** Requires the configured party to reach a number of Nightsoul Burst triggers inside an optional overlap window. */
export interface CombatActionEffectTeamNightsoulBurstCondition {
  readonly kind: "team_nightsoul_burst"
  readonly minimumTriggers: number
  readonly windowSeconds?: number
}

/** Requires every configured party element to belong to one set and optionally requires specific elements. */
export interface CombatActionEffectTeamElementSubsetCondition {
  readonly allowedElements: readonly Exclude<Element, "physical">[]
  readonly kind: "team_element_subset"
  readonly requiredElements?: readonly Exclude<Element, "physical">[]
}

/** Counts teammates whose configured elemental identity differs from the equipped primary character. */
export interface CombatActionEffectPrimaryDifferentElementTeammateCountCondition {
  readonly kind: "primary_different_element_teammate_count"
  readonly maximum?: number
  readonly minimum: number
}

/** Counts teammates whose configured elemental identity matches the equipped primary character. */
export interface CombatActionEffectPrimarySameElementTeammateCountCondition {
  readonly kind: "primary_same_element_teammate_count"
  readonly maximum?: number
  readonly minimum: number
}

/** Requires the equipped primary character's maintained Burst Energy cost to fall in one range. */
export interface CombatActionEffectPrimaryBurstEnergyCostCondition {
  readonly kind: "primary_burst_energy_cost"
  readonly maximum?: number
  readonly minimum?: number
}

/** Counts configured party members belonging to one maintained character region. */
export interface CombatActionEffectTeamRegionCountCondition {
  readonly kind: "team_region_count"
  readonly maximum?: number
  readonly minimum: number
  readonly region: string
}

/** Counts party members who either belong to one region or differ elementally from the primary character. */
export interface CombatActionEffectPrimaryDifferentElementOrRegionPartyCountCondition {
  readonly kind: "primary_different_element_or_region_party_count"
  readonly maximum?: number
  readonly minimum: number
  readonly region: string
}

/** Requires the party-derived Moonsign state to reach at least the declared level. */
export interface CombatActionEffectMoonsignLevelCondition {
  readonly kind: "moonsign_level"
  readonly minimum: "nascent_gleam" | "ascendant_gleam"
}

/** Requires at least two configured Hexerei characters in the party. */
export interface CombatActionEffectHexereiSecretRiteCondition {
  readonly kind: "hexerei_secret_rite"
}

export type CombatActionEffectCondition =
  | CombatActionEffectEnemyCountCondition
  | CombatActionEffectHexereiSecretRiteCondition
  | CombatActionEffectMoonsignLevelCondition
  | CombatActionEffectPrimaryBurstEnergyCostCondition
  | CombatActionEffectPrimaryDifferentElementOrRegionPartyCountCondition
  | CombatActionEffectPrimaryNightsoulBlessingCondition
  | CombatActionEffectSourceNightsoulBlessingCondition
  | CombatActionEffectTeamNightsoulBurstCondition
  | CombatActionEffectTeamElementCountCondition
  | CombatActionEffectTeamElementSubsetCondition
  | CombatActionEffectTeamRegionCountCondition
  | CombatActionEffectPrimaryDifferentElementTeammateCountCondition
  | CombatActionEffectPrimarySameElementTeammateCountCondition
  | CombatActionEffectTeamUniqueElementCountCondition

/** A mutually exclusive family of selected snapshots, such as the Millennial Movement weapon buffs. */
export interface CombatActionEffectExclusivity {
  readonly group: string
  readonly variant: string
}

/** A current-action state that content can establish without inferring a rotation, timing window, or trigger history. */
export type CombatActionDeterministicSnapshotCapability = "after_primary_burst"

/**
 * Automatically selects an active effect when the selected action explicitly establishes every required
 * current-action state. Weapon comparisons use the same deterministic state.
 */
export interface CombatActionEffectDeterministicSnapshotActivation {
  readonly requiredActionSnapshotCapabilities: readonly [
    CombatActionDeterministicSnapshotCapability,
    ...CombatActionDeterministicSnapshotCapability[]
  ]
}

/** Identifies the configuration that owns an action effect without binding it to one evaluator. */
export type CombatActionEffectSource =
  | {
      /** "party_member" is used by explicitly selected team-set snapshots such as Noblesse four-piece. */
      readonly holder?: "party_member" | "primary"
      readonly kind: "artifact_set"
      readonly minimumPieces: number
      readonly setId: string
    }
  | {
      readonly characterId: string
      readonly kind: "character"
      readonly minimumSourceAscension?: number
      readonly minimumSourceConstellation?: number
      readonly travelerElement?: TravelerElement
    }
  | {
      /** "party_member" permits an explicitly selected team-weapon snapshot such as Wolf's Gravestone. */
      readonly holder?: "party_member" | "primary"
      readonly kind: "weapon"
      /** Resolves one contribution per matching party holder when same-name effects are designed to stack. */
      readonly resolveAllMatchingPartySources?: true
      readonly weaponId: string
    }

/** A fixed or refinement-indexed scalar used by a typed current-action effect. */
export type CombatActionEffectScalar =
  | { readonly kind: "fixed"; readonly value: number }
  | { readonly kind: "refinement_table"; readonly values: readonly number[] }

/** A talent-table value that can also be reused as a source-stat conversion coefficient or cap. */
export interface CombatActionEffectTalentScalar {
  readonly kind: "talent_parameter"
  readonly multiplier?: number
  readonly parameter: CombatTalentParameterReference
}

/** A fixed, refinement-indexed, or talent-level-aware scalar. */
export type CombatActionEffectComputedScalar = CombatActionEffectScalar | CombatActionEffectTalentScalar

/** Provides a fixed, refinement-indexed, or scenario-derived action effect value. */
export type CombatActionEffectValue =
  | CombatActionEffectScalar
  | (CombatActionEffectTalentScalar & {
      /** Reads one source-character talent value at its configured level and multiplies it by a bounded scalar. */
      readonly constellationMultiplierBonuses?: readonly {
        readonly minimumSourceConstellation: number
        readonly value: number
      }[]
    })
  | {
      /** An elemental-mastery conversion resolved after all selected elemental-mastery effects. */
      readonly kind: "final_elemental_mastery"
      /** Caps this final-elemental-mastery conversion after its multiplier has been applied. */
      readonly maximumValue?: CombatActionEffectComputedScalar
      readonly multiplier: CombatActionEffectComputedScalar
      /** Added to the source stat before applying the multiplier. */
      readonly offset?: number
    }
  | {
      /** A final-maximum-HP conversion resolved after all HP contributions, with an optional per-effect cap. */
      readonly kind: "final_hp"
      readonly maximumValue?: CombatActionEffectScalar
      readonly multiplier: CombatActionEffectComputedScalar
      /** Added to the source stat before applying the multiplier. */
      readonly offset?: number
    }
  | {
      /** A source-owned final-defense conversion with an optional per-effect cap. */
      readonly kind: "source_final_defense"
      readonly maximumValue?: CombatActionEffectComputedScalar
      readonly multiplier: CombatActionEffectComputedScalar
      /** Added to the source stat before applying the multiplier. */
      readonly offset?: number
      /**
       * Active self-stat snapshots that are guaranteed to be present on the source when this conversion is captured.
       * These contribute only while resolving the source's final defense, never as independent effects on the recipient.
       */
      readonly sourceDefenseSnapshotEffectIds?: readonly string[]
    }
  | {
    /** A source-owned final-attack conversion with an optional per-effect cap. */
    readonly kind: "source_final_attack"
    readonly maximumValue?: CombatActionEffectComputedScalar
    readonly multiplier: CombatActionEffectComputedScalar
    /** Added to the source stat before applying the multiplier. */
    readonly offset?: number
    /**
     * Active self-stat snapshots that are guaranteed to be present on the source when this conversion is captured.
     * These contribute only while resolving the source's final attack, never as independent effects on the recipient.
     */
    readonly sourceAttackSnapshotEffectIds?: readonly string[]
  }
  | {
      /** Converts the source character and weapon's configured base attack into a recipient stat. */
      readonly kind: "source_base_attack"
      readonly multiplier: CombatActionEffectComputedScalar
    }
  | {
      readonly kind: "source_stat"
      readonly maximumValue?: CombatActionEffectScalar
      readonly minimumValue?: CombatActionEffectScalar
      readonly multiplier: CombatActionEffectScalar
      /** Added before the multiplier, such as converting only ER above 100%. */
      readonly offset?: number
      readonly sourceStat: "energyRecharge"
    }
  | {
      readonly kind: "team_burst_energy_cost"
      readonly maximumValue?: CombatActionEffectScalar
      readonly multiplier: CombatActionEffectScalar
      readonly requiresFullParty: true
    }

/** A standalone equipment trigger that is evaluated as an additional direct damage event. */
export interface CombatActionAdditionalDamageEvent {
  readonly canCrit: boolean
  /** Overrides normal crit-rate expectation when the selected trigger guarantees this independent hit will crit. */
  readonly critPolicy?: "guaranteed"
  readonly coefficient: CombatActionEffectScalar
  /** Uses the selected recipient's native element for character-owned coordinated attacks. */
  readonly element: Element | "recipient_native"
  /** Probability that the trigger occurs for this one selected core action. */
  readonly expectedTriggerProbability: number | CombatActionEffectScalar
  readonly kind: "additional_damage_event"
  /** This event intentionally cannot inherit the triggering action's reaction declaration or application. */
  readonly reactionPolicy: "none"
  readonly scalingStat: ScalingStat
  /** Adds a flat base-damage term derived from the selected recipient's final attack. */
  readonly recipientFinalAttackFlatDamageMultiplier?: CombatActionEffectComputedScalar
  /** Adds a flat base-damage term derived from the effect owner's final attack. */
  readonly sourceFinalAttackFlatDamageMultiplier?: CombatActionEffectComputedScalar
}

/** A stat-scaled term added to the triggering hit before that hit's reaction and common damage multipliers. */
export interface CombatActionMatchedAdditiveDamageTerm {
  readonly coefficient: CombatActionEffectScalar
  readonly kind: "matched_action_additive_damage_term"
  readonly scalingStat: ScalingStat
}

/** Shared activation metadata for a typed current-action effect. */
interface CombatActionEffectActivation {
  readonly activation: "active" | "automatic" | "maximum_reachable"
  /** Keeps a reachable active effect out of automatic maximum selection and exposes it as an explicit UI choice. */
  readonly selectionMode?: "optional" | "required"
  /** Selects this reachable state by default only when comparing the weapon for one of the listed recipients. */
  readonly weaponComparisonDefault?: {
    readonly recipientCharacterIds: readonly string[]
  }
  /**
   * Active snapshot IDs that must be selected before this effect can apply. Scenario evaluation derives the effect
   * automatically once every requirement and its own source constraints are satisfied.
   */
  readonly requiredActiveEffectIds?: readonly string[]
}

/** A conventional numeric effect that contributes to one named stat stage. */
export interface CombatActionStatEffect extends CombatActionEffectActivation {
  /** Required when target is actionParameter. */
  readonly actionParameterId?: string
  /** Explicit action-state requirements that make this active effect automatic. */
  readonly deterministicSnapshotActivation?: CombatActionEffectDeterministicSnapshotActivation
  /** A scenario-derived condition required before this effect can contribute to the selected action. */
  readonly condition?: CombatActionEffectCondition
  /** Active effects with different variants in the same group cannot contribute together. */
  readonly exclusivity?: CombatActionEffectExclusivity
  readonly id: string
  readonly label: string
  readonly source: CombatActionEffectSource
  readonly target: Exclude<CombatActionEffectTarget, "additionalDamageEvent" | "matchedActionAdditiveDamageTerm">
  readonly targetFilter?: CombatActionEffectTargetFilter
  readonly value: CombatActionEffectValue
}

/** An equipment trigger that contributes one independent, auditable damage event to the selected action. */
export interface CombatActionAdditionalDamageEventEffect extends CombatActionEffectActivation {
  /** Explicit action-state requirements that make this active effect automatic. */
  readonly deterministicSnapshotActivation?: CombatActionEffectDeterministicSnapshotActivation
  /** A scenario-derived condition required before this effect can contribute to the selected action. */
  readonly condition?: CombatActionEffectCondition
  /** Active effects with different variants in the same group cannot contribute together. */
  readonly exclusivity?: CombatActionEffectExclusivity
  readonly id: string
  readonly label: string
  readonly source: CombatActionEffectSource
  readonly target: "additionalDamageEvent"
  readonly targetFilter?: CombatActionEffectTargetFilter
  readonly value: CombatActionAdditionalDamageEvent
}

/** An effect that adds one typed stat term to every eligible hit of the selected action. */
export interface CombatActionMatchedAdditiveDamageTermEffect extends CombatActionEffectActivation {
  /** Explicit action-state requirements that make this active effect automatic. */
  readonly deterministicSnapshotActivation?: CombatActionEffectDeterministicSnapshotActivation
  /** A scenario-derived condition required before this effect can contribute to the selected action. */
  readonly condition?: CombatActionEffectCondition
  /** Active effects with different variants in the same group cannot contribute together. */
  readonly exclusivity?: CombatActionEffectExclusivity
  readonly id: string
  readonly label: string
  readonly source: CombatActionEffectSource
  readonly target: "matchedActionAdditiveDamageTerm"
  readonly targetFilter?: CombatActionEffectTargetFilter
  readonly value: CombatActionMatchedAdditiveDamageTerm
}

/**
 * A typed contribution to the currently selected action.
 *
 * Automatic effects are enabled by the primary build's equipped weapon or set. Active effects are
 * explicit current-action snapshots selected through `ScenarioConditions.activeEffectIds`.
 */
export type CombatActionEffect =
  | CombatActionAdditionalDamageEventEffect
  | CombatActionMatchedAdditiveDamageTermEffect
  | CombatActionStatEffect

/** A constellation that raises the configured talent level for one action before reading its table. */
export interface CombatActionTalentLevelConstellationBonus {
  readonly id: string
  readonly label: string
  readonly minimumSourceConstellation: number
  /** The exact talent table slot raised by this bonus; omitted legacy entries fall back to the action slot. */
  readonly talentSlot?: CombatTalentParameterSlot
  readonly value: number
}

/** A character-owned constellation that raises one named talent table for every declared consumer. */
export interface CombatCharacterTalentLevelConstellationBonus {
  readonly minimumSourceConstellation: number
  readonly talentSlot: Exclude<CombatTalentParameterSlot, "passive">
  /** Restricts a Traveler constellation to its selected elemental form. */
  readonly travelerElement?: TravelerElement
  readonly value: number
}

/** A maintained element override contributed by one active character-kit effect. */
export interface CombatElementOverrideEffect {
  /** Snapshot checks prevent a content duration from drifting away from the pinned game-data table. */
  readonly durationChecks: readonly CombatTalentCoefficientSnapshotCheck[]
  /** Resolves the source effect duration at the configured source talent level. */
  readonly durationParameter: CombatTalentParameterReference
  readonly eligibleWeaponTypes: readonly CombatMeleeWeaponType[]
  readonly element: Exclude<Element, "physical">
  readonly id: string
  readonly label: string
  /** The source must meet this constellation before the effect can be activated, when specified. */
  readonly minimumSourceConstellation?: number
  /** Active snapshot IDs that must be selected before this override can apply. */
  readonly requiredActiveEffectIds?: readonly string[]
  readonly sourceCharacterId: string
  readonly target: RotationElementOverrideTarget
}

/** One character-owned current-action state that may be selected when its source build is in the party. */
export interface CombatCharacterScenarioEffectOption {
  /** Omitted when the state can affect any selected action. */
  readonly actionIds?: readonly string[]
  readonly id: string
  readonly label: string
  readonly minimumSourceConstellation?: number
}

/** Metadata for one prospective rotation action, independent from its numeric calculation. */
export interface CombatActionMetadata {
  readonly additiveReaction?: AdditiveReactionConfig
  readonly amplifyingReaction?: AmplifyingReactionConfig
  /** Distinguishes a normal/charged/plunge hit when the action's talent slot alone is insufficient. */
  readonly attackKind?: CombatAttackKind
  /** A kit-owned source-stat-to-attack conversion with an explicit cap. */
  readonly cappedStatToAttackConversion?: CombatActionCappedStatToAttackConversion
  readonly characterId: string
  readonly damageKind?: CombatDamageKind
  readonly damageParts?: readonly CombatDamagePart[]
  /** Static current-action states established by this action's declaration, never inferred from a rotation. */
  readonly deterministicSnapshotCapabilities?: readonly CombatActionDeterministicSnapshotCapability[]
  readonly element: Element
  readonly evaluator?: CombatActionEvaluator
  readonly id: string
  /** Explicit source-kit contributions applied to one calculation stage for this action only. */
  readonly intrinsicEffects?: readonly CombatActionIntrinsicEffect[]
  readonly kind: CombatActionKind
  readonly parameterReferences?: readonly CombatParameterReference[]
  readonly scalingStat?: ScalingStat
  /** Independent Moon or stellar formula metadata for a single explicitly declared damage action. */
  readonly specialReaction?: CombatDirectSpecialReactionConfig
  /** Bounded, action-owned input state such as current projectile hits or stored resource count. */
  readonly scenarioParameters?: readonly CombatActionIntegerScenarioParameter[]
  readonly status: CombatCoverageStatus
  /** Constellation-granted talent levels that are applicable before this action reads a talent table. */
  readonly talentLevelConstellationBonuses?: readonly CombatActionTalentLevelConstellationBonus[]
  /** Overrides the raw snapshot owner when a static character has multiple talent variants, such as Traveler. */
  readonly talentParameterOwnerId?: string
  readonly talentSlot: CombatTalentSlot
  /** Restricts an element-specific Traveler action to the matching canonical Traveler build variant. */
  readonly travelerElement?: TravelerElement
  /** Declares one explicitly selected transformative-reaction metric without deriving aura or event timing. */
  readonly transformativeReaction?: CombatTransformativeReactionConfig
  /** Optional explicit event timing; omitted legacy declarations compile every damage part at cast time. */
  readonly timeline?: CombatActionTimeline
  /** Optional content-owned formula presentation for a multi-event action. */
  readonly tracePresentation?: CombatActionTracePresentation
}

/** Content-level declaration for one character's combat coverage. */
export interface CharacterCombatCoverage {
  readonly actions: readonly CombatActionMetadata[]
  /** Current-action stat or enemy-state snapshots sourced by this character. */
  readonly actionEffects?: readonly CombatActionEffect[]
  readonly characterId: string
  readonly detail: string
  /** Character-owned effects that the scenario layer may activate only when their source build is present. */
  readonly effects?: readonly CombatElementOverrideEffect[]
  readonly label: string
  /** Default source-owned outputs; any friendly recipient is selected at evaluation time, never hard-coded here. */
  readonly metrics?: readonly CombatMetricDefinition[]
  /** Character-owned selectable states projected to scenario controls by the content layer. */
  readonly scenarioEffectOptions?: readonly CombatCharacterScenarioEffectOption[]
  readonly status: CombatCoverageStatus
  /** Character-owned talent-level constellations shared by actions and support metrics. */
  readonly talentLevelConstellationBonuses?: readonly CombatCharacterTalentLevelConstellationBonus[]
}
