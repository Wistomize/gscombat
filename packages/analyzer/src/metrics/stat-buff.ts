import {
  normalizeProjectedMetricLabel, type CombatFlatStatBuffMetricDefinition
} from "@gscombat/content"
import {
  type CharacterBuild
} from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"
import {
  addFormula,
  applyConditions, multiplyFormula, sourceStatTerm
} from "./formula.js"


import type {
  CombatFlatStatBuffMetricEvaluation, CombatMetricFormulaNode, CombatMetricSourceContext
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

import type { ResolvedFriendlyRecipient } from "./runtime.js"
import * as runtime from "./runtime.js"

export function evaluateFlatStatBuffMetric(
  metric: CombatFlatStatBuffMetricDefinition,
  build: CharacterBuild,
  recipient: ResolvedFriendlyRecipient,
  sourceContext: CombatMetricSourceContext | undefined,
  teammates: readonly CharacterBuild[] | undefined,
  gameData: GameDataRepository
): CombatFlatStatBuffMetricEvaluation {
  const label = normalizeProjectedMetricLabel(metric.label)
  const stats = runtime.resolveMetricSourceCombatStats(metric, build, sourceContext, teammates, gameData)
  const ratio = runtime.resolveMetricParameter(metric, metric.ratioParameter, build, gameData)
  const ratioConstellationBonus = (metric.ratioConstellationBonuses ?? []).reduce(
    (total, bonus) => total + (build.constellation >= bonus.minimumConstellation ? bonus.value : 0),
    0
  )
  const scalingValue = runtime.getMetricScalingValue(metric.scalingStat, stats)
  const ratioOperands: CombatMetricFormulaNode[] = [
    runtime.talentParameterTerm("领域加攻倍率", metric.ratioParameter, ratio)
  ]
  if (ratioConstellationBonus !== 0) {
    ratioOperands.push({
      kind: "term",
      label: "命之座额外倍率",
      role: "source_constellation",
      value: ratioConstellationBonus
    })
  }
  const ratioFormula = addFormula("最终领域加攻倍率", ratioOperands)
  const potentialFormula = multiplyFormula("领域加攻值", [
    sourceStatTerm(metric.scalingStat, scalingValue),
    ratioFormula
  ])
  const formula = applyConditions(potentialFormula, recipient.conditions)
  return {
    affectedStat: metric.affectedStat,
    conditions: recipient.conditions,
    formula,
    id: metric.id,
    kind: "stat_buff",
    label,
    potentialValue: potentialFormula.value,
    ratio: ratio.value,
    ratioConstellationBonus,
    recipient: recipient.recipient,
    scalingStat: metric.scalingStat,
    scalingValue,
    sourceActionId: metric.sourceActionId,
    talentLevel: ratio.talentLevel,
    unit: "attack",
    value: formula.value
  }
}
