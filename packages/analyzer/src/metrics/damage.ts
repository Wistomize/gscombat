import {
  normalizeProjectedMetricLabel, type CombatDamageMetricDefinition
} from "@gscombat/content"

import { evaluateScenario } from "../scenario/evaluate.js"

import type {
  CombatDamageMetricEvaluation, EvaluateCombatMetricInput
} from "./types.js"

export type {
  CombatDamageMetricEvaluation,
  CombatDamageMetricFormula,
  CombatFlatStatBuffMetricEvaluation,
  CombatHealingMetricEvaluation,
  CombatMetricConditionEvaluation,
  CombatMetricEvaluation,
  CombatMetricEvaluationContext,
  CombatMetricFormula,
  CombatMetricFormulaAdd,
  CombatMetricFormulaCondition,
  CombatMetricFormulaMaximum,
  CombatMetricFormulaMinimum,
  CombatMetricFormulaMultiply,
  CombatMetricFormulaNode,
  CombatMetricFormulaTerm,
  CombatMetricFriendlyRecipient,
  CombatMetricFriendlyRecipientContext,
  CombatMetricSourceContext,
  CombatScalarMetricEvaluation,
  EvaluateCombatMetricInput
} from "./types.js"


export function evaluateDamageMetric(
  metric: CombatDamageMetricDefinition,
  input: EvaluateCombatMetricInput
): CombatDamageMetricEvaluation {
  if (!input.scenario) throw new Error(`Damage metric ${metric.id} requires an action scenario`)
  const conditions = { ...input.scenario.conditions }
  if (input.scenario.targetActionId !== metric.actionId) delete conditions.actionParameters

  const evaluation = evaluateScenario(
    { ...input.scenario, conditions, primary: input.build, targetActionId: metric.actionId },
    input.gameData
  )
  const value = evaluation.actionExpectedDamage
  const label = normalizeProjectedMetricLabel(metric.label)
  return {
    actionId: metric.actionId,
    conditions: [],
    formula: { events: evaluation.rotation.events, kind: "rotation_events", value },
    id: metric.id,
    kind: "damage",
    label,
    potentialValue: value,
    sourceActionId: metric.sourceActionId,
    target: { kind: "enemy" },
    unit: "damage",
    value
  }
}
