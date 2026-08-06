import {
  listHealingEquipmentEffects, normalizeProjectedMetricLabel,
  resolveHealingEquipmentEffectValue, type CombatScaledHealingMetricDefinition
} from "@gscombat/content"
import {
  type CharacterBuild
} from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"
import {
  addFormula,
  applyConditions,
  constantTerm, minimumFormula,
  modifierTerm,
  multiplyFormula,
  recipientStateTerm,
  sourceStatTerm
} from "./formula.js"


import type {
  CombatHealingMetricEvaluation, CombatMetricFormulaNode, CombatMetricSourceContext
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

import type { ResolvedFriendlyRecipient, ResolvedSourceHealingEquipmentEffect } from "./runtime.js"
import * as runtime from "./runtime.js"

export function evaluateHealingMetric(
  metric: CombatScaledHealingMetricDefinition,
  build: CharacterBuild,
  recipient: ResolvedFriendlyRecipient,
  sourceContext: CombatMetricSourceContext | undefined,
  teammates: readonly CharacterBuild[] | undefined,
  gameData: GameDataRepository
): CombatHealingMetricEvaluation {
  const label = normalizeProjectedMetricLabel(metric.label)
  const stats = runtime.resolveMetricSourceCombatStats(metric, build, sourceContext, teammates, gameData)
  const percentage = runtime.resolveMetricParameter(metric, metric.percentageParameter, build, gameData)
  const flatParameter = metric.flatParameter
  const resolvedFlatParameter = flatParameter
    ? runtime.resolveMetricParameter(metric, flatParameter, build, gameData)
    : undefined
  const flatAmount = (metric.flat ?? 0) + (resolvedFlatParameter?.value ?? 0)
  if (resolvedFlatParameter && percentage.talentLevel !== resolvedFlatParameter.talentLevel) {
    throw new Error(`Combat metric ${metric.id} resolves its healing parameters at inconsistent talent levels`)
  }

  const scalingValue = runtime.getMetricScalingValue(metric.scalingStat, stats)
  const additionalScalingTerms = (metric.additionalScalingTerms ?? []).map((term) =>
    runtime.resolveHealingAdditionalScalingTerm(term, build, stats)
  )
  const sourceHealingBonuses = metric.includeHealingBonus
    ? (metric.sourceHealingBonuses ?? []).map((bonus) => runtime.resolveHealingSourceBonus(bonus, build, sourceContext))
    : []
  const sourceWeaponHealingEffects = metric.includeHealingBonus
    ? resolveSourceWeaponHealingEquipmentEffects(build)
    : []
  const sourceConditions = [
    ...additionalScalingTerms.flatMap((term) => term.conditions),
    ...sourceHealingBonuses.flatMap((bonus) => bonus.conditions)
  ]
  const kitHealingBonus = sourceHealingBonuses.reduce((total, bonus) => total + bonus.formula.value, 0)
  const weaponHealingBonus = sourceWeaponHealingEffects.reduce((total, effect) => total + effect.value, 0)
  const healingBonus = metric.includeHealingBonus ? stats.healingBonus + kitHealingBonus + weaponHealingBonus : 0
  const artifactSetHealingBonus = metric.includeHealingBonus ? stats.artifactSetHealingBonus : 0
  const sourceScaling = multiplyFormula("治疗百分比部分", [
    sourceStatTerm(metric.scalingStat, scalingValue),
    runtime.talentParameterTerm("单跳治疗百分比", metric.percentageParameter, percentage)
  ])
  const conditionalScalingBonuses = (metric.conditionalScalingBonuses ?? []).map((bonus) =>
    runtime.resolveConditionalHealingScalingBonus(metric, bonus, build, recipient, scalingValue)
  )
  const baseHealing = addFormula("基础单跳治疗", [
    sourceScaling,
    ...(flatParameter && resolvedFlatParameter
      ? [runtime.talentParameterTerm("单跳固定治疗", flatParameter, resolvedFlatParameter)]
      : []),
    ...(metric.flat === undefined ? [] : [constantTerm("单跳固定治疗", metric.flat)]),
    ...additionalScalingTerms.map((term) => term.formula),
    ...conditionalScalingBonuses
  ])
  const sourceHealingBonusOperands: CombatMetricFormulaNode[] = [
    constantTerm("基础倍率", 1),
    modifierTerm("source_modifier", "来源治疗加成（非两件套）", stats.healingBonus - artifactSetHealingBonus)
  ]
  if (artifactSetHealingBonus !== 0) {
    sourceHealingBonusOperands.push(
      modifierTerm("source_modifier", "两件套治疗加成", artifactSetHealingBonus)
    )
  }
  sourceHealingBonusOperands.push(...sourceHealingBonuses.map((bonus) => bonus.formula))
  sourceHealingBonusOperands.push(
    ...sourceWeaponHealingEffects.map((effect) => modifierTerm("source_modifier", effect.label, effect.value))
  )
  const sourceHealingMultiplier = addFormula("来源治疗加成", sourceHealingBonusOperands)
  const sourceFormula = multiplyFormula("来源治疗量", [baseHealing, sourceHealingMultiplier])
  const recipientIncomingHealingEffects = runtime.selectRecipientEquipmentEffects(
    recipient.recipientEquipmentEffects,
    "incomingHealingBonus"
  )
  const recipientHealingMultiplier = addFormula("受益角色受疗加成", [
    constantTerm("基础倍率", 1),
    modifierTerm("recipient_modifier", "手填受益角色受疗加成", recipient.manualIncomingHealingBonus),
    ...recipientIncomingHealingEffects.map((effect) =>
      modifierTerm("recipient_modifier", effect.label, effect.value)
    )
  ])
  const potentialFormula = multiplyFormula("受益角色单跳治疗量", [sourceFormula, recipientHealingMultiplier])
  const formula = applyConditions(potentialFormula, recipient.conditions)
  const actualRestoredFormula =
    recipient.missingHp === undefined
      ? undefined
      : minimumFormula("实际恢复生命", [
          formula,
          recipientStateTerm("受益角色当前生命缺口", recipient.missingHp)
        ])
  return {
    ...(actualRestoredFormula === undefined
      ? {}
      : {
          actualRestoredFormula,
          actualRestoredValue: actualRestoredFormula.value,
          missingHp: recipient.missingHp
        }),
    conditions: [...sourceConditions, ...recipient.conditions],
    flatAmount,
    formula,
    healingBonus,
    id: metric.id,
    incomingHealingBonus: recipient.incomingHealingBonus,
    kind: "healing",
    label,
    percentage: percentage.value,
    potentialValue: potentialFormula.value,
    recipient: recipient.recipient,
    scalingStat: metric.scalingStat,
    scalingValue,
    sourceActionId: metric.sourceActionId,
    sourceValue: sourceFormula.value,
    talentLevel: percentage.talentLevel,
    unit: "hp",
    value: formula.value
  }
}

/** Resolves static outgoing-healing effects owned by the source weapon without treating them as base stats. */
function resolveSourceWeaponHealingEquipmentEffects(
  build: CharacterBuild
): readonly ResolvedSourceHealingEquipmentEffect[] {
  const resolvedEffects: ResolvedSourceHealingEquipmentEffect[] = []
  for (const effect of listHealingEquipmentEffects()) {
    if (effect.source.kind !== "weapon" || effect.source.weaponId !== build.weapon.weaponId) continue
    resolvedEffects.push({
      label: effect.label,
      value: resolveHealingEquipmentEffectValue(effect, build.weapon.refinement)
    })
  }
  return resolvedEffects
}
