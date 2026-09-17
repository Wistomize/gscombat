import {
  getCombatMetricDefinition
} from "@gscombat/content"


import type {
  CombatMetricEvaluation, EvaluateCombatMetricInput
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

import { evaluateDamageMetric } from "./damage.js"
import { resolveSupportFieldContext } from "../core/field-presence.js"
import { evaluateHealingMetric } from "./healing.js"
import * as runtime from "./runtime.js"
import { evaluateScalarMetric } from "./scalar.js"
import { evaluateFlatStatBuffMetric } from "./stat-buff.js"

export function evaluateCombatMetric(input: EvaluateCombatMetricInput): CombatMetricEvaluation {
  const metric = getCombatMetricDefinition(input.metricId)
  if (!metric) throw new Error(`Combat metric ${input.metricId} is not registered`)

  runtime.assertMetricBuild(metric, input.build)
  if (input.context?.onFieldBuildId !== undefined &&
    ![input.build, ...(input.context.teammates ?? [])].some((build) => build.buildId === input.context!.onFieldBuildId)) {
    throw new Error("前台角色必须是当前队伍成员")
  }
  if (metric.kind === "damage") return evaluateDamageMetric(metric, input)
  if (metric.kind === "scalar") return evaluateScalarMetric(metric, input)

  const recipient = runtime.resolveFriendlyRecipient(metric, input)
  if (metric.kind === "healing") {
    return evaluateHealingMetric(
      metric,
      input.build,
      recipient,
      input.context?.source,
      input.context?.teammates,
      input.gameData,
      resolveSupportFieldContext(input.build.buildId, input.context?.onFieldBuildId)
    )
  }
  return evaluateFlatStatBuffMetric(
    metric,
    input.build,
    recipient,
    input.context?.source,
    input.context?.teammates,
    input.gameData,
    resolveSupportFieldContext(input.build.buildId, input.context?.onFieldBuildId)
  )
}
