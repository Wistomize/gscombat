import type { Element, RotationEventResult } from "@gscombat/calculator"
import type {
  CombatDamageBonusAttackType,
  CombatMetricScalingStat,
  CombatScalarMetricSemantic,
  CombatScalarMetricUnit
} from "@gscombat/content"
import type {
  CharacterBuild,
  EvaluationScenario,
  MetricEvaluationContext,
  MetricFriendlyRecipientContext,
  MetricSourceContext
} from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

/** Supplies runtime state for one selected friendly recipient of a support metric. */
export type CombatMetricFriendlyRecipientContext = MetricFriendlyRecipientContext

/** Supplies runtime state for the source character when a support metric needs an explicit self condition. */
export type CombatMetricSourceContext = MetricSourceContext

/** Binds a source metric to the current party and, where needed, one friendly recipient. */
export type CombatMetricEvaluationContext = MetricEvaluationContext

/** Supplies a single character build, metric selection, and only the context required by that metric. */
export interface EvaluateCombatMetricInput {
  readonly build: CharacterBuild
  readonly context?: CombatMetricEvaluationContext
  readonly gameData: GameDataRepository
  readonly metricId: string
  /** Required only for a selected damage metric; support metrics use their explicit recipient context. */
  readonly scenario?: EvaluationScenario
}

/** A leaf in a support metric's developer-maintained, UI-renderable formula tree. */
export interface CombatMetricFormulaTerm {
  readonly kind: "term"
  readonly label: string
  readonly parameterId?: string
  readonly role:
    | "constant"
    | "recipient_modifier"
    | "recipient_state"
    | "source_constellation"
    | "source_action_snapshot"
    | "source_modifier"
    | "source_stat"
    | "source_talent_parameter"
  readonly stat?: CombatMetricScalingStat
  readonly talentLevel?: number
  readonly value: number
}

/** Adds several support-formula terms or subexpressions. */
export interface CombatMetricFormulaAdd {
  readonly kind: "add"
  readonly label: string
  readonly operands: readonly CombatMetricFormulaNode[]
  readonly value: number
}

/** Multiplies several support-formula terms or subexpressions. */
export interface CombatMetricFormulaMultiply {
  readonly kind: "multiply"
  readonly label: string
  readonly operands: readonly CombatMetricFormulaNode[]
  readonly value: number
}

/** Caps an evaluated support value by a state-dependent maximum such as the recipient's missing HP. */
export interface CombatMetricFormulaMinimum {
  readonly kind: "minimum"
  readonly label: string
  readonly operands: readonly [CombatMetricFormulaNode, CombatMetricFormulaNode]
  readonly value: number
}

/** Floors an evaluated support expression at a state-dependent minimum. */
export interface CombatMetricFormulaMaximum {
  readonly kind: "maximum"
  readonly label: string
  readonly operands: readonly [CombatMetricFormulaNode, CombatMetricFormulaNode]
  readonly value: number
}

/** Reports whether one explicitly declared source-side or recipient-side requirement was met. */
export type CombatMetricConditionEvaluation =
  | {
      readonly kind: "recipient_in_source_area"
      readonly label: string
      readonly satisfied: boolean
    }
  | {
      readonly comparison: "at_most" | "above"
      readonly currentHpFraction?: number
      readonly kind: "recipient_hp_fraction"
      readonly label: string
      readonly satisfied: boolean
      readonly threshold: number
      readonly waived: boolean
    }
  | {
      readonly actualAscension: number
      readonly kind: "source_ascension"
      readonly label: string
      readonly minimumAscension: number
      readonly satisfied: boolean
    }
  | {
      readonly comparison: "at_most" | "above"
      readonly currentHpFraction: number
      readonly kind: "source_hp_fraction"
      readonly label: string
      readonly satisfied: boolean
      readonly threshold: number
    }

/** Wraps a support-formula result in one checked recipient-side condition. */
export interface CombatMetricFormulaCondition {
  readonly condition: CombatMetricConditionEvaluation
  readonly kind: "condition"
  readonly operand: CombatMetricFormulaNode
  readonly satisfied: boolean
  readonly value: number
}

/** The recursive formula tree emitted by a strongly typed support-metric evaluator. */
export type CombatMetricFormulaNode =
  | CombatMetricFormulaAdd
  | CombatMetricFormulaCondition
  | CombatMetricFormulaMaximum
  | CombatMetricFormulaMinimum
  | CombatMetricFormulaMultiply
  | CombatMetricFormulaTerm

/** Reuses authoritative event traces so parameterized and timed actions retain their complete formula structure. */
export interface CombatDamageMetricFormula {
  readonly events: readonly RotationEventResult[]
  readonly kind: "rotation_events"
  readonly value: number
}

/** A formula payload that can be rendered for either damage or any typed support metric. */
export type CombatMetricFormula = CombatDamageMetricFormula | CombatMetricFormulaNode

/** Identifies the selected friendly recipient in one support-metric result. */
export interface CombatMetricFriendlyRecipient {
  readonly buildId: string
  readonly characterId: string
  readonly kind: "friendly_recipient"
}

/** Identifies the enemy result used by a selected damage metric. */
export interface CombatMetricEnemyTarget {
  readonly kind: "enemy"
}

/** Identifies a scalar result that is applied only to the configured source character. */
export interface CombatMetricSelfTarget {
  readonly characterId: string
  readonly kind: "self"
}

/** Shared resolved output fields for one source-owned metric in its explicit evaluation context. */
interface CombatMetricEvaluationBase {
  readonly conditions: readonly CombatMetricConditionEvaluation[]
  readonly formula: CombatMetricFormula
  readonly id: string
  readonly label: string
  readonly potentialValue: number
  readonly sourceActionId: string
  readonly value: number
}

/** A selected core-action expected-damage value for the current character. */
export interface CombatDamageMetricEvaluation extends CombatMetricEvaluationBase {
  readonly actionId: string
  readonly kind: "damage"
  readonly target: CombatMetricEnemyTarget
  readonly unit: "damage"
}

/** One selected recipient's single healing result from the current source character. */
export interface CombatHealingMetricEvaluation extends CombatMetricEvaluationBase {
  /** Present only when the caller supplied the recipient's exact current HP deficit. */
  readonly actualRestoredFormula?: CombatMetricFormulaNode
  /** Present only when the caller supplied the recipient's exact current HP deficit. */
  readonly actualRestoredValue?: number
  readonly flatAmount: number
  readonly healingBonus: number
  readonly incomingHealingBonus: number
  readonly kind: "healing"
  readonly missingHp?: number
  readonly percentage: number
  readonly recipient: CombatMetricFriendlyRecipient
  readonly scalingStat: Exclude<CombatMetricScalingStat, "base_attack">
  readonly scalingValue: number
  readonly sourceValue: number
  readonly talentLevel: number
  readonly unit: "hp"
}

/** One selected recipient's flat stat contribution from the current source character. */
export interface CombatFlatStatBuffMetricEvaluation extends CombatMetricEvaluationBase {
  readonly affectedStat: "attack_flat"
  readonly kind: "stat_buff"
  readonly ratio: number
  readonly ratioConstellationBonus: number
  readonly recipient: CombatMetricFriendlyRecipient
  readonly scalingStat: CombatMetricScalingStat
  readonly scalingValue: number
  readonly talentLevel: number
  readonly unit: "attack"
}

/** One standalone scalar output such as a shield, damage bonus, or resistance reduction. */
export interface CombatScalarMetricEvaluation extends CombatMetricEvaluationBase {
  readonly affectedElement?: Exclude<Element, "physical">
  readonly appliesTo?: readonly CombatDamageBonusAttackType[]
  readonly flatAmount: number
  readonly kind: "scalar"
  readonly maximumValue?: number
  readonly ratio: number
  readonly scalingStat?: CombatMetricScalingStat
  readonly scalingValue?: number
  readonly semantic: CombatScalarMetricSemantic
  readonly target: CombatMetricEnemyTarget | CombatMetricFriendlyRecipient | CombatMetricSelfTarget
  readonly unit: CombatScalarMetricUnit
  readonly uncappedValue: number
}

/** A typed result whose unit remains separate from other character outputs. */
export type CombatMetricEvaluation =
  | CombatDamageMetricEvaluation
  | CombatFlatStatBuffMetricEvaluation
  | CombatHealingMetricEvaluation
  | CombatScalarMetricEvaluation
