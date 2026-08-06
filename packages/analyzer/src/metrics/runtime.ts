import {
  getCombatActionDefinition, listCharacterTalentLevelConstellationBonuses, listRecipientEquipmentEffects, resolveRecipientEquipmentEffectValue, type CombatDamageMetricDefinition, type CombatHealingAdditionalScalingTerm,
  type CombatHealingConditionalScalingBonus,
  type CombatHealingSourceBonus,
  type CombatMetricDefinition,
  type CombatMetricRatioScenarioParameter,
  type CombatMetricRecipientRequirement,
  type CombatMetricScalingStat,
  type CombatMetricSourceHpFractionRequirement,
  type CombatMetricTalentParameter,
  type CombatScalarMetricDefinition, type CombatScaledHealingMetricDefinition,
  type RecipientEquipmentEffect
} from "@gscombat/content"
import {
  validateCharacterBuild,
  type CharacterBuild
} from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"
import {
  applyConditions, modifierTerm,
  multiplyFormula, sourceStatTerm
} from "./formula.js"

import { countArtifactSet } from "../core/artifact-stats.js"
import { resolveCoreCombatStats, type ResolvedCoreCombatStats } from "../core/base-stats.js"
import {
  resolvePrimaryDifferentElementTeammateCount,
  resolvePrimarySameElementTeammateCount,
  resolveTalentParameterOwnerId,
  resolveTeamUniqueElementCount
} from "../core/build-variant.js"
import { resolveFinalHpToFlatAttack, resolveSelfAutomaticEquipmentEffects } from "../effects/action-effects.js"
import { resolveActionScenarioParameters } from "../evaluators/scenario-parameters.js"

import type {
  CombatMetricConditionEvaluation, CombatMetricEvaluationContext, CombatMetricFormulaNode,
  CombatMetricFormulaTerm,
  CombatMetricFriendlyRecipient,
  CombatMetricFriendlyRecipientContext,
  CombatMetricSourceContext, EvaluateCombatMetricInput
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

interface ResolvedMetricParameter {
  readonly talentLevel: number
  readonly value: number
}

interface ResolvedMetricRatioScenarioParameter {
  readonly label: string
  readonly parameterId: string
  readonly value: number
}

export interface ResolvedFriendlyRecipient {
  readonly conditions: readonly CombatMetricConditionEvaluation[]
  readonly incomingHealingBonus: number
  readonly manualIncomingHealingBonus: number
  readonly missingHp?: number
  readonly recipient: CombatMetricFriendlyRecipient
  readonly recipientContext: CombatMetricFriendlyRecipientContext
  readonly recipientEquipmentEffects: readonly ResolvedRecipientEquipmentEffect[]
}

/** One recipient-owned equipment effect after its holder and refinement have both been resolved. */
export interface ResolvedRecipientEquipmentEffect {
  readonly id: string
  readonly label: string
  /** Build whose equipped effect supplied this recipient-side modifier. */
  readonly sourceBuildId: string
  readonly target: RecipientEquipmentEffect["target"]
  readonly value: number
}

/** One source-owned healing equipment effect after the equipped weapon refinement is resolved. */
export interface ResolvedSourceHealingEquipmentEffect {
  readonly label: string
  readonly value: number
}

/** Resolves one optional source-kit contribution while preserving any state gates in the formula trace. */
interface ResolvedHealingSourceContribution {
  readonly conditions: readonly CombatMetricConditionEvaluation[]
  readonly formula: CombatMetricFormulaNode
}

/** Evaluates one maintainer-selected metric with its explicit damage or party context. */
export function assertMetricBuild(
  metric: CombatMetricDefinition,
  build: CharacterBuild,
  gameData: GameDataRepository
): void {
  assertValidBuild(build, gameData, "source character")
  if (metric.status !== "verified") throw new Error(`Combat metric ${metric.id} is not verified`)
  if (metric.characterId !== build.characterId) {
    throw new Error(`Combat metric ${metric.id} belongs to ${metric.characterId}, not ${build.characterId}`)
  }
  const sourceAction = getCombatActionDefinition(metric.sourceActionId)
  if (!sourceAction) throw new Error(`Combat metric ${metric.id} references missing source action ${metric.sourceActionId}`)
  resolveTalentParameterOwnerId(sourceAction, build)
}

export function assertValidBuild(build: CharacterBuild, gameData: GameDataRepository, description: string): void {
  const validationErrors = validateCharacterBuild(build)
  if (validationErrors.length > 0) {
    throw new Error(`Invalid ${description} build ${build.buildId}: ${validationErrors.join("; ")}`)
  }
  if (build.gameDataVersion !== gameData.getManifest().gameVersion) {
    throw new Error(`Game-data version mismatch for ${description} build ${build.buildId}: ${build.gameDataVersion}`)
  }
}

export function resolveFriendlyRecipient(
  metric: Extract<CombatMetricDefinition, { readonly target: "friendly_recipient" }>,
  input: EvaluateCombatMetricInput
): ResolvedFriendlyRecipient {
  const context = input.context
  const recipientContext = context?.recipient
  if (!recipientContext) throw new Error(`Combat metric ${metric.id} requires a friendly recipient context`)

  const party = [input.build, ...(context?.teammates ?? [])]
  const buildIds = new Set<string>()
  for (const member of party) {
    if (buildIds.has(member.buildId)) throw new Error(`Metric party contains duplicate build ${member.buildId}`)
    buildIds.add(member.buildId)
    if (member.buildId !== input.build.buildId) assertValidBuild(member, input.gameData, "teammate")
  }

  const recipientBuild = party.find((member) => member.buildId === recipientContext.buildId)
  if (!recipientBuild) {
    throw new Error(`Metric recipient ${recipientContext.buildId} is not the source character or a selected teammate`)
  }

  const manualIncomingHealingBonus = recipientContext.incomingHealingBonus ?? 0
  if (!Number.isFinite(manualIncomingHealingBonus) || manualIncomingHealingBonus <= -1) {
    throw new Error(`Metric recipient ${recipientBuild.buildId} has an invalid incoming healing bonus`)
  }
  const recipientEquipmentEffects = [
    ...resolveRecipientEquipmentEffects(recipientBuild),
    ...resolveActiveRecipientEquipmentEffects(
      party,
      context?.activeEffectIds ?? [],
      context?.activeEffectSourceBuildIds
    )
  ]
  const incomingHealingBonus =
    manualIncomingHealingBonus +
    sumRecipientEquipmentEffectValues(
      selectRecipientEquipmentEffects(recipientEquipmentEffects, "incomingHealingBonus")
    )
  const missingHp = recipientContext.missingHp
  if (missingHp !== undefined && (!Number.isFinite(missingHp) || missingHp < 0)) {
    throw new Error(`Metric recipient ${recipientBuild.buildId} has an invalid missing HP value`)
  }

  return {
    conditions: metric.recipientRequirements.map((requirement) =>
      evaluateRecipientRequirement(requirement, recipientContext, input.build)
    ),
    incomingHealingBonus,
    manualIncomingHealingBonus,
    ...(missingHp === undefined ? {} : { missingHp }),
    recipient: {
      buildId: recipientBuild.buildId,
      characterId: recipientBuild.characterId,
      kind: "friendly_recipient"
    },
    recipientContext,
    recipientEquipmentEffects
  }
}

/** Resolves static equipment effects owned by one build when it receives a support metric result. */
export function resolveRecipientEquipmentEffects(build: CharacterBuild): readonly ResolvedRecipientEquipmentEffect[] {
  const resolvedEffects: ResolvedRecipientEquipmentEffect[] = []
  for (const effect of listRecipientEquipmentEffects()) {
    if (effect.activation === "active") continue
    if (!isRecipientEquipmentEffectEquipped(effect, build)) continue
    resolvedEffects.push({
      id: effect.id,
      label: effect.label,
      sourceBuildId: build.buildId,
      target: effect.target,
      value: resolveRecipientEquipmentEffectValue(effect, build.weapon.refinement)
    })
  }
  return resolvedEffects
}

/** Resolves only manually selected party-owned equipment snapshots for the current support-metric recipient. */
export function resolveActiveRecipientEquipmentEffects(
  party: readonly CharacterBuild[],
  activeEffectIds: readonly string[],
  activeEffectSourceBuildIds: Readonly<Record<string, string>> | undefined
): readonly ResolvedRecipientEquipmentEffect[] {
  const activeEffectIdSet = new Set(activeEffectIds)
  const duplicateEffectId = activeEffectIds.find((effectId, index) => activeEffectIds.indexOf(effectId) !== index)
  if (duplicateEffectId !== undefined) {
    throw new Error(`Metric equipment snapshots contain duplicate active effect ${duplicateEffectId}`)
  }
  const unmatchedSourceSelectionEffectId = Object.keys(activeEffectSourceBuildIds ?? {}).find(
    (effectId) => !activeEffectIdSet.has(effectId)
  )
  if (unmatchedSourceSelectionEffectId !== undefined) {
    throw new Error(
      `Metric equipment source selection ${unmatchedSourceSelectionEffectId} has no matching active effect`
    )
  }
  const allEffects = listRecipientEquipmentEffects()
  const activeEffectsById = new Map(
    allEffects.filter((effect) => effect.activation === "active").map((effect) => [effect.id, effect])
  )
  const allEffectsById = new Map(allEffects.map((effect) => [effect.id, effect]))

  return activeEffectIds.map((effectId) => {
    const effect = activeEffectsById.get(effectId)
    if (!effect) {
      if (allEffectsById.has(effectId)) {
        throw new Error(`Metric equipment effect ${effectId} is automatic and cannot be selected`)
      }
      throw new Error(`Metric equipment effect ${effectId} is not registered`)
    }
    const sources = party.filter((build) => isRecipientEquipmentEffectEquipped(effect, build))
    const source = resolveActiveRecipientEquipmentEffectSource(
      effect,
      sources,
      activeEffectSourceBuildIds?.[effect.id]
    )
    return {
      id: effect.id,
      label: effect.label,
      sourceBuildId: source.buildId,
      target: effect.target,
      value: resolveRecipientEquipmentEffectValue(effect, source.weapon.refinement)
    }
  })
}

/** Selects one eligible party holder without inferring which same-set teammate created the active snapshot. */
export function resolveActiveRecipientEquipmentEffectSource(
  effect: RecipientEquipmentEffect,
  candidates: readonly CharacterBuild[],
  selectedSourceBuildId: string | undefined
): CharacterBuild {
  if (candidates.length === 0) {
    throw new Error(`Metric equipment effect ${effect.id} has no eligible party source`)
  }
  if (selectedSourceBuildId !== undefined) {
    const selected = candidates.find((build) => build.buildId === selectedSourceBuildId)
    if (!selected) {
      throw new Error(`Metric equipment effect ${effect.id} cannot use source ${selectedSourceBuildId}`)
    }
    return selected
  }
  if (candidates.length > 1) {
    throw new Error(`Metric equipment effect ${effect.id} has multiple eligible party sources; select one explicitly`)
  }
  return candidates[0]!
}

/** Checks whether one recipient-owned effect belongs to the exact build receiving the metric result. */
export function isRecipientEquipmentEffectEquipped(effect: RecipientEquipmentEffect, build: CharacterBuild): boolean {
  if (effect.source.kind === "artifact_set") {
    return countArtifactSet(build, effect.source.setId) >= effect.source.minimumPieces
  }
  return build.weapon.weaponId === effect.source.weaponId
}

/** Returns recipient-owned equipment effects that contribute to one explicitly typed metric modifier. */
export function selectRecipientEquipmentEffects(
  effects: readonly ResolvedRecipientEquipmentEffect[],
  target: RecipientEquipmentEffect["target"]
): readonly ResolvedRecipientEquipmentEffect[] {
  return effects.filter((effect) => effect.target === target)
}

/** Sums one homogeneous recipient-side modifier after its equipment ownership has been resolved. */
export function sumRecipientEquipmentEffectValues(effects: readonly ResolvedRecipientEquipmentEffect[]): number {
  return effects.reduce((total, effect) => total + effect.value, 0)
}

export function evaluateRecipientRequirement(
  requirement: CombatMetricRecipientRequirement,
  recipient: CombatMetricFriendlyRecipientContext,
  sourceBuild: CharacterBuild
): CombatMetricConditionEvaluation {
  if (requirement.kind === "recipient_in_source_area") {
    if (typeof recipient.isWithinSourceArea !== "boolean") {
      throw new Error(`Metric recipient ${recipient.buildId} must declare whether they are within the source area`)
    }
    return { kind: requirement.kind, label: requirement.label, satisfied: recipient.isWithinSourceArea }
  }

  const waived =
    requirement.waivedAtSourceConstellation !== undefined &&
    sourceBuild.constellation >= requirement.waivedAtSourceConstellation
  if (waived) {
    return {
      comparison: requirement.comparison,
      kind: requirement.kind,
      label: requirement.label,
      satisfied: true,
      threshold: requirement.threshold,
      waived: true
    }
  }

  const currentHpFraction = recipient.currentHpFraction
  if (!Number.isFinite(currentHpFraction) || currentHpFraction === undefined || currentHpFraction < 0 || currentHpFraction > 1) {
    throw new Error(`Metric recipient ${recipient.buildId} must declare a current HP fraction between zero and one`)
  }
  const satisfied =
    requirement.comparison === "at_most"
      ? currentHpFraction <= requirement.threshold
      : currentHpFraction > requirement.threshold
  return {
    comparison: requirement.comparison,
    currentHpFraction,
    kind: requirement.kind,
    label: requirement.label,
    satisfied,
    threshold: requirement.threshold,
    waived: false
  }
}

/** Resolves a support metric's source build with only explicitly contextualized self-owned equipment passives. */
export function resolveMetricSourceCombatStats(
  metric: Pick<CombatMetricDefinition, "sourceActionId">,
  build: CharacterBuild,
  sourceContext: CombatMetricSourceContext | undefined,
  teammates: readonly CharacterBuild[] | undefined,
  gameData: GameDataRepository
): ResolvedCoreCombatStats {
  const coreStats = resolveCoreCombatStats(build, gameData)
  const action = getCombatActionDefinition(metric.sourceActionId)
  if (!action) return coreStats

  const configuredTeammates = teammates ?? []
  const teamUniqueElementCount = resolveTeamUniqueElementCount([build, ...configuredTeammates], gameData)
  const primaryDifferentElementTeammateCount = resolvePrimaryDifferentElementTeammateCount(
    build,
    configuredTeammates,
    gameData
  )
  const primarySameElementTeammateCount = resolvePrimarySameElementTeammateCount(build, configuredTeammates, gameData)
  const effects = resolveSelfAutomaticEquipmentEffects({
    action,
    baseEnergyRecharge: coreStats.energyRecharge,
    gameData,
    includeMaximumReachableCharacterStatEffects: true,
    ...(sourceContext?.enemyCount === undefined ? {} : { enemyCount: sourceContext.enemyCount }),
    primary: build,
    ...(primaryDifferentElementTeammateCount === null ? {} : { primaryDifferentElementTeammateCount }),
    ...(primarySameElementTeammateCount === null ? {} : { primarySameElementTeammateCount }),
    ...(teamUniqueElementCount === null ? {} : { teamUniqueElementCount }),
    teammates: configuredTeammates
  })
  const hp = coreStats.hp + coreStats.baseHp * effects.hpPercent + effects.hpFlat
  const attackPercent = coreStats.attackPercent + effects.attackPercent
  const flatAttack = coreStats.flatAttack + resolveFinalHpToFlatAttack(hp, effects)
  return {
    ...coreStats,
    attack: coreStats.baseAttack * (1 + attackPercent) + flatAttack,
    attackPercent,
    critDamage: coreStats.critDamage + effects.critDamage,
    critRate: coreStats.critRate + effects.critRate,
    defense: coreStats.defense + coreStats.baseDefense * effects.defensePercent + effects.defenseFlat,
    elementalMastery: coreStats.elementalMastery + effects.elementalMastery,
    energyRecharge: coreStats.energyRecharge + effects.energyRecharge,
    flatAttack,
    hp
  }
}

export function resolveHealingAdditionalScalingTerm(
  term: CombatHealingAdditionalScalingTerm,
  build: CharacterBuild,
  stats: ResolvedCoreCombatStats
): ResolvedHealingSourceContribution {
  const scalingValue = getMetricScalingValue(term.scalingStat, stats)
  const formula = multiplyFormula(term.label, [
    sourceStatTerm(term.scalingStat, scalingValue),
    modifierTerm("source_modifier", "额外治疗倍率", term.ratio)
  ])
  return applySourceAscensionRequirement(term.label, term.minimumSourceAscension, build, formula)
}

export function resolveHealingSourceBonus(
  bonus: CombatHealingSourceBonus,
  build: CharacterBuild,
  sourceContext: CombatMetricSourceContext | undefined
): ResolvedHealingSourceContribution {
  const initial = applySourceAscensionRequirement(
    bonus.label,
    bonus.minimumSourceAscension,
    build,
    modifierTerm("source_modifier", bonus.label, bonus.value)
  )
  if (initial.conditions.some((condition) => !condition.satisfied) || !bonus.sourceRequirement) return initial

  const sourceCondition = evaluateSourceHpFractionRequirement(bonus.sourceRequirement, sourceContext, build)
  return {
    conditions: [...initial.conditions, sourceCondition],
    formula: applyConditions(initial.formula, [sourceCondition])
  }
}

export function applySourceAscensionRequirement(
  label: string,
  minimumSourceAscension: number | undefined,
  build: CharacterBuild,
  formula: CombatMetricFormulaNode
): ResolvedHealingSourceContribution {
  if (minimumSourceAscension === undefined) return { conditions: [], formula }

  const condition: CombatMetricConditionEvaluation = {
    actualAscension: build.ascension,
    kind: "source_ascension",
    label: `${label}（需要${minimumSourceAscension}阶突破）`,
    minimumAscension: minimumSourceAscension,
    satisfied: build.ascension >= minimumSourceAscension
  }
  return { conditions: [condition], formula: applyConditions(formula, [condition]) }
}

export function evaluateSourceHpFractionRequirement(
  requirement: CombatMetricSourceHpFractionRequirement,
  sourceContext: CombatMetricSourceContext | undefined,
  sourceBuild: CharacterBuild
): CombatMetricConditionEvaluation {
  const currentHpFraction = sourceContext?.currentHpFraction
  if (!Number.isFinite(currentHpFraction) || currentHpFraction === undefined || currentHpFraction < 0 || currentHpFraction > 1) {
    throw new Error(`Metric source ${sourceBuild.buildId} must declare a current HP fraction between zero and one`)
  }
  const satisfied =
    requirement.comparison === "at_most"
      ? currentHpFraction <= requirement.threshold
      : currentHpFraction > requirement.threshold
  return {
    comparison: requirement.comparison,
    currentHpFraction,
    kind: requirement.kind,
    label: requirement.label,
    satisfied,
    threshold: requirement.threshold
  }
}

export function resolveConditionalHealingScalingBonus(
  metric: CombatScaledHealingMetricDefinition,
  bonus: CombatHealingConditionalScalingBonus,
  build: CharacterBuild,
  recipient: ResolvedFriendlyRecipient,
  scalingValue: number
): CombatMetricFormulaNode {
  if (build.constellation < bonus.minimumSourceConstellation) {
    return {
      kind: "term",
      label: `${bonus.label}（${bonus.minimumSourceConstellation}命未激活）`,
      role: "source_constellation",
      value: 0
    }
  }
  const conditionalFormula = multiplyFormula(bonus.label, [
    sourceStatTerm(metric.scalingStat, scalingValue),
    modifierTerm("source_modifier", "条件追加治疗倍率", bonus.ratio)
  ])
  const condition = evaluateRecipientRequirement(bonus.recipientRequirement, recipient.recipientContext, build)
  return applyConditions(conditionalFormula, [condition])
}

export function talentParameterTerm(
  label: string,
  parameter: CombatMetricTalentParameter,
  resolved: ResolvedMetricParameter
): CombatMetricFormulaTerm {
  const valueMultiplier = parameter.valueMultiplier ?? 1
  return {
    kind: "term",
    label: valueMultiplier === 1 ? label : `${label}（天赋原始值 × ${valueMultiplier}）`,
    parameterId: parameter.reference.id,
    role: "source_talent_parameter",
    talentLevel: resolved.talentLevel,
    value: resolved.value
  }
}

export function actionScenarioParameterTerm(
  parameter: ResolvedMetricRatioScenarioParameter
): CombatMetricFormulaTerm {
  return {
    kind: "term",
    label: parameter.label,
    parameterId: parameter.parameterId,
    role: "source_action_snapshot",
    value: parameter.value
  }
}

export function resolveMetricRatioScenarioParameter(
  metric: CombatScalarMetricDefinition,
  parameter: CombatMetricRatioScenarioParameter,
  build: CharacterBuild,
  context: CombatMetricEvaluationContext | undefined
): ResolvedMetricRatioScenarioParameter {
  const sourceAction = getCombatActionDefinition(metric.sourceActionId)
  if (!sourceAction) throw new Error(`Combat metric ${metric.id} references missing source action ${metric.sourceActionId}`)
  const definition = sourceAction.scenarioParameters?.find((candidate) => candidate.id === parameter.parameterId)
  if (!definition) {
    throw new Error(`Metric ${metric.id} references missing action snapshot ${parameter.parameterId}`)
  }

  const resolvedActionParameters = resolveActionScenarioParameters(
    sourceAction,
    context?.actionParameters,
    build.constellation
  )
  const value = resolvedActionParameters.get(parameter.parameterId)
  if (value === undefined) throw new Error(`Metric ${metric.id} has no action snapshot ${parameter.parameterId}`)
  return { label: definition.label, parameterId: definition.id, value }
}

export function resolveMetricParameter(
  metric: Exclude<CombatMetricDefinition, CombatDamageMetricDefinition>,
  parameter: CombatMetricTalentParameter,
  build: CharacterBuild,
  gameData: GameDataRepository
): ResolvedMetricParameter {
  const sourceAction = getCombatActionDefinition(metric.sourceActionId)
  if (!sourceAction) throw new Error(`Combat metric ${metric.id} references missing source action ${metric.sourceActionId}`)

  const talentLevel = getMetricTalentLevel(metric, build, parameter)
  const talentParameterOwnerId = resolveTalentParameterOwnerId(sourceAction, build)
  const rawValue = gameData.getCharacterSkillParameter(
    talentParameterOwnerId,
    parameter.reference.groupId,
    parameter.reference.parameterIndex,
    talentLevel
  )
  if (rawValue === undefined) {
    throw new Error(
      `Missing metric parameter ${parameter.reference.id} for ${talentParameterOwnerId} at level ${talentLevel}`
    )
  }
  return { talentLevel, value: rawValue * (parameter.valueMultiplier ?? 1) }
}

export function getMetricTalentLevel(
  metric: Exclude<CombatMetricDefinition, CombatDamageMetricDefinition>,
  build: CharacterBuild,
  parameter: CombatMetricTalentParameter
): number {
  if (parameter.reference.talentSlot === "passive") return 1
  const configuredTalentLevel =
    parameter.reference.talentSlot === "normal"
      ? build.talents.normal
      : parameter.reference.talentSlot === "skill"
        ? build.talents.skill
        : build.talents.burst
  const travelerElement = build.variant?.kind === "traveler" ? build.variant.element : undefined
  const characterBonuses = listCharacterTalentLevelConstellationBonuses(metric.characterId, travelerElement).filter(
    (constellationBonus) => constellationBonus.talentSlot === parameter.reference.talentSlot
  )
  const bonus = characterBonuses
    .filter((constellationBonus) => build.constellation >= constellationBonus.minimumSourceConstellation)
    .reduce((total, constellationBonus) => total + constellationBonus.value, 0)
  return Math.min(configuredTalentLevel + bonus, 15)
}

export function getMetricScalingValue(stat: CombatMetricScalingStat, stats: ResolvedCoreCombatStats): number {
  if (stat === "attack") return stats.attack
  if (stat === "base_attack") return stats.baseAttack
  if (stat === "defense") return stats.defense
  if (stat === "elementalMastery") return stats.elementalMastery
  return stats.hp
}
