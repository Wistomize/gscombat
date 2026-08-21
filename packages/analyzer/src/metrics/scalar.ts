import {
  normalizeProjectedMetricLabel, type CombatScalarMetricDefinition
} from "@gscombat/content"
import {
  addFormula,
  applyConditions,
  constantTerm,
  maximumFormula,
  minimumFormula,
  modifierTerm,
  multiplyFormula, sourceStatTerm
} from "./formula.js"


import type {
  CombatMetricFormulaNode, CombatScalarMetricEvaluation,
  EvaluateCombatMetricInput
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

import type { ResolvedFriendlyRecipient, ResolvedRecipientEquipmentEffect } from "./runtime.js"
import * as runtime from "./runtime.js"

export function evaluateScalarMetric(
  metric: CombatScalarMetricDefinition,
  input: EvaluateCombatMetricInput
): CombatScalarMetricEvaluation {
  const label = normalizeProjectedMetricLabel(metric.label)
  const stats = runtime.resolveMetricSourceCombatStats(
    metric,
    input.build,
    input.context?.source,
    input.context?.teammates,
    input.gameData
  )
  const ratioParameterDefinition = metric.ratioParameter
  const flatParameterDefinition = metric.flatParameter
  const maximumValueParameterDefinition = metric.maximumValueParameter
  const ratioScenarioParameterDefinition = metric.ratioScenarioParameter
  const ratioParameter = ratioParameterDefinition
    ? runtime.resolveMetricParameter(metric, ratioParameterDefinition, input.build, input.gameData)
    : undefined
  const flatParameter = flatParameterDefinition
    ? runtime.resolveMetricParameter(metric, flatParameterDefinition, input.build, input.gameData)
    : undefined
  const maximumValueParameter = maximumValueParameterDefinition
    ? runtime.resolveMetricParameter(metric, maximumValueParameterDefinition, input.build, input.gameData)
    : undefined
  const ratioScenarioParameter = ratioScenarioParameterDefinition
    ? runtime.resolveMetricRatioScenarioParameter(metric, ratioScenarioParameterDefinition, input.build, input.context)
    : undefined
  const ratioConstellationBonus = (metric.ratioConstellationBonuses ?? []).reduce(
    (total, bonus) => total + (input.build.constellation >= bonus.minimumConstellation ? bonus.value : 0),
    0
  )
  const baseRatio = (metric.ratio ?? 0) + (ratioParameter?.value ?? 0) + ratioConstellationBonus
  const ratio = baseRatio * (ratioScenarioParameter?.value ?? 1)
  const flatAmount = (metric.flat ?? 0) + (flatParameter?.value ?? 0)
  const operands: CombatMetricFormulaNode[] = []
  let scalingValue: number | undefined
  const ratioOperands: CombatMetricFormulaNode[] = []
  if (metric.ratio !== undefined) ratioOperands.push(constantTerm("固定倍率", metric.ratio))
  if (ratioParameter && ratioParameterDefinition) {
    ratioOperands.push(runtime.talentParameterTerm("天赋倍率", ratioParameterDefinition, ratioParameter))
  }
  if (ratioConstellationBonus !== 0) {
    ratioOperands.push({
      kind: "term",
      label: "命之座额外倍率",
      role: "source_constellation",
      value: ratioConstellationBonus
    })
  }
  const ratioFormula = addFormula("最终倍率", ratioOperands)
  const effectiveRatioFormula = ratioScenarioParameter
    ? multiplyFormula("动作快照后的倍率", [ratioFormula, runtime.actionScenarioParameterTerm(ratioScenarioParameter)])
    : ratioFormula

  if (metric.scalingStat) {
    scalingValue = runtime.getMetricScalingValue(metric.scalingStat, stats)
    const scalingFloor = metric.minimumScalingValue ?? 0
    const eligibleScalingFormula = maximumFormula("参与计算的来源属性", [
      addFormula("超过起算值的来源属性", [
        sourceStatTerm(metric.scalingStat, scalingValue),
        constantTerm("起算值", -scalingFloor)
      ]),
      constantTerm("最低参与值", 0)
    ])
    operands.push(multiplyFormula("来源属性贡献", [eligibleScalingFormula, effectiveRatioFormula]))
  } else if (ratioOperands.length > 0) {
    operands.push(effectiveRatioFormula)
  }
  if (metric.flat !== undefined) operands.push(constantTerm("固定值", metric.flat))
  if (flatParameter && flatParameterDefinition) {
    operands.push(runtime.talentParameterTerm("天赋固定值", flatParameterDefinition, flatParameter))
  }

  const uncappedFormula = addFormula(label, operands)
  const maximumValue = metric.maximumValue ?? maximumValueParameter?.value
  const maximumValueFormula = maximumValueParameter && maximumValueParameterDefinition
    ? runtime.talentParameterTerm("天赋效果上限", maximumValueParameterDefinition, maximumValueParameter)
    : maximumValue === undefined
      ? undefined
      : constantTerm("效果上限", maximumValue)
  const basePotentialFormula = maximumValueFormula
    ? minimumFormula("上限修正", [uncappedFormula, maximumValueFormula])
    : uncappedFormula
  const recipient = metric.target === "friendly_recipient" ? runtime.resolveFriendlyRecipient(metric, input) : undefined
  const target = resolveScalarMetricTarget(metric, input, recipient)
  const shieldStrengthEffects = resolveShieldStrengthEffects(metric, target, recipient)
  const shieldStrengthMultiplier =
    shieldStrengthEffects.length === 0
      ? undefined
      : addFormula("护盾承受者护盾强效", [
          constantTerm("基础倍率", 1),
          ...shieldStrengthEffects.map((effect) => modifierTerm("recipient_modifier", effect.label, effect.value))
        ])
  const potentialFormula = shieldStrengthMultiplier
    ? multiplyFormula("护盾强效后的吸收量", [basePotentialFormula, shieldStrengthMultiplier])
    : basePotentialFormula
  const sourceContribution = runtime.applySourceAscensionRequirement(
    label,
    metric.minimumSourceAscension,
    input.build,
    potentialFormula
  )
  const conditions = [...sourceContribution.conditions, ...(recipient?.conditions ?? [])]
  const formula = applyConditions(sourceContribution.formula, recipient?.conditions ?? [])
  return {
    ...(metric.affectedElement === undefined ? {} : { affectedElement: metric.affectedElement }),
    ...(metric.appliesTo === undefined ? {} : { appliesTo: metric.appliesTo }),
    conditions,
    flatAmount,
    formula,
    id: metric.id,
    kind: "scalar",
    label,
    ...(maximumValue === undefined ? {} : { maximumValue }),
    potentialValue: potentialFormula.value,
    ratio,
    ...(metric.scalingStat === undefined || scalingValue === undefined
      ? {}
      : { scalingStat: metric.scalingStat, scalingValue }),
    semantic: metric.semantic,
    sourceActionId: metric.sourceActionId,
    target,
    uncappedValue: uncappedFormula.value,
    unit: metric.unit,
    value: formula.value
  }
}

/** Resolves shield strength only from the build that will actually receive the calculated shield. */
function resolveShieldStrengthEffects(
  metric: CombatScalarMetricDefinition,
  target: CombatScalarMetricEvaluation["target"],
  recipient: ResolvedFriendlyRecipient | undefined
): readonly ResolvedRecipientEquipmentEffect[] {
  if (metric.semantic !== "shield" || target.kind !== "friendly_recipient") return []
  return runtime.selectRecipientEquipmentEffects(recipient?.recipientEquipmentEffects ?? [], "shieldStrength")
}

function resolveScalarMetricTarget(
  metric: CombatScalarMetricDefinition,
  input: EvaluateCombatMetricInput,
  recipient: ResolvedFriendlyRecipient | undefined
): CombatScalarMetricEvaluation["target"] {
  if (metric.target === "enemy") return { kind: "enemy" }
  if (metric.target === "self") return { characterId: input.build.characterId, kind: "self" }
  if (!recipient) throw new Error(`Combat metric ${metric.id} requires a friendly recipient context`)
  const routing = metric.recipientTargetRouting
  if (!routing) return recipient.recipient
  if (routing !== "active_recipient_if_moonsign_else_self") {
    throw new Error(`Combat metric ${metric.id} declares an unsupported recipient target route`)
  }
  if (typeof recipient.recipientContext.isMoonsign !== "boolean") {
    throw new Error(`Combat metric ${metric.id} requires the active recipient Moonsign state`)
  }
  return recipient.recipientContext.isMoonsign
    ? recipient.recipient
    : { characterId: input.build.characterId, kind: "self" }
}
