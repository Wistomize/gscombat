import type { Element, RotationEventResult } from "@gscombat/calculator"
import {
  getCombatActionDefinition,
  getCombatMetricDefinition,
  listCharacterTalentLevelConstellationBonuses,
  listHealingEquipmentEffects,
  listRecipientEquipmentEffects,
  resolveHealingEquipmentEffectValue,
  resolveRecipientEquipmentEffectValue,
  type CombatDamageBonusAttackType,
  type CombatDamageMetricDefinition,
  type CombatFlatStatBuffMetricDefinition,
  type CombatHealingAdditionalScalingTerm,
  type CombatHealingConditionalScalingBonus,
  type CombatHealingSourceBonus,
  type CombatMetricDefinition,
  type CombatMetricRecipientRequirement,
  type CombatMetricRatioScenarioParameter,
  type CombatMetricScalingStat,
  type CombatMetricSourceHpFractionRequirement,
  type CombatMetricTalentParameter,
  type CombatScalarMetricDefinition,
  type CombatScalarMetricSemantic,
  type CombatScalarMetricUnit,
  type CombatScaledHealingMetricDefinition,
  type RecipientEquipmentEffect
} from "@gscombat/content"
import {
  type CharacterBuild,
  type EvaluationScenario,
  type MetricEvaluationContext,
  type MetricFriendlyRecipientContext,
  type MetricSourceContext,
  validateCharacterBuild
} from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

import { countArtifactSet } from "./artifact-stats.js"
import { resolveCoreCombatStats, type ResolvedCoreCombatStats } from "./base-stats.js"
import { resolveFinalHpToFlatAttack, resolveSelfAutomaticEquipmentEffects } from "./action-effects.js"
import {
  resolvePrimaryDifferentElementTeammateCount,
  resolvePrimarySameElementTeammateCount,
  resolveTalentParameterOwnerId,
  resolveTeamUniqueElementCount
} from "./build-variant.js"
import { getScenarioParameterMinimumSourceConstellation } from "./declared-scenario.js"
import { evaluateScenario } from "./scenario.js"

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

interface ResolvedMetricParameter {
  readonly talentLevel: number
  readonly value: number
}

interface ResolvedMetricRatioScenarioParameter {
  readonly label: string
  readonly parameterId: string
  readonly value: number
}

interface ResolvedFriendlyRecipient {
  readonly conditions: readonly CombatMetricConditionEvaluation[]
  readonly incomingHealingBonus: number
  readonly manualIncomingHealingBonus: number
  readonly missingHp?: number
  readonly recipient: CombatMetricFriendlyRecipient
  readonly recipientContext: CombatMetricFriendlyRecipientContext
  readonly recipientEquipmentEffects: readonly ResolvedRecipientEquipmentEffect[]
}

/** One recipient-owned equipment effect after its holder and refinement have both been resolved. */
interface ResolvedRecipientEquipmentEffect {
  readonly id: string
  readonly label: string
  /** Build whose equipped effect supplied this recipient-side modifier. */
  readonly sourceBuildId: string
  readonly target: RecipientEquipmentEffect["target"]
  readonly value: number
}

/** One source-owned healing equipment effect after the equipped weapon refinement is resolved. */
interface ResolvedSourceHealingEquipmentEffect {
  readonly label: string
  readonly value: number
}

/** Resolves one optional source-kit contribution while preserving any state gates in the formula trace. */
interface ResolvedHealingSourceContribution {
  readonly conditions: readonly CombatMetricConditionEvaluation[]
  readonly formula: CombatMetricFormulaNode
}

/** Evaluates one maintainer-selected metric with its explicit damage or party context. */
export function evaluateCombatMetric(input: EvaluateCombatMetricInput): CombatMetricEvaluation {
  const metric = getCombatMetricDefinition(input.metricId)
  if (!metric) throw new Error(`Combat metric ${input.metricId} is not registered`)

  assertMetricBuild(metric, input.build, input.gameData)
  if (metric.kind === "damage") return evaluateDamageMetric(metric, input)
  if (metric.kind === "scalar") return evaluateScalarMetric(metric, input)

  const recipient = resolveFriendlyRecipient(metric, input)
  if (metric.kind === "healing") {
    return evaluateHealingMetric(
      metric,
      input.build,
      recipient,
      input.context?.source,
      input.context?.teammates,
      input.gameData
    )
  }
  return evaluateFlatStatBuffMetric(
    metric,
    input.build,
    recipient,
    input.context?.source,
    input.context?.teammates,
    input.gameData
  )
}

function assertMetricBuild(
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

function assertValidBuild(build: CharacterBuild, gameData: GameDataRepository, description: string): void {
  const validationErrors = validateCharacterBuild(build)
  if (validationErrors.length > 0) {
    throw new Error(`Invalid ${description} build ${build.buildId}: ${validationErrors.join("; ")}`)
  }
  if (build.gameDataVersion !== gameData.getManifest().gameVersion) {
    throw new Error(`Game-data version mismatch for ${description} build ${build.buildId}: ${build.gameDataVersion}`)
  }
}

function evaluateDamageMetric(
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
  return {
    actionId: metric.actionId,
    conditions: [],
    formula: { events: evaluation.rotation.events, kind: "rotation_events", value },
    id: metric.id,
    kind: "damage",
    label: metric.label,
    potentialValue: value,
    sourceActionId: metric.sourceActionId,
    target: { kind: "enemy" },
    unit: "damage",
    value
  }
}

function resolveFriendlyRecipient(
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
function resolveRecipientEquipmentEffects(build: CharacterBuild): readonly ResolvedRecipientEquipmentEffect[] {
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
function resolveActiveRecipientEquipmentEffects(
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
function resolveActiveRecipientEquipmentEffectSource(
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
function isRecipientEquipmentEffectEquipped(effect: RecipientEquipmentEffect, build: CharacterBuild): boolean {
  if (effect.source.kind === "artifact_set") {
    return countArtifactSet(build, effect.source.setId) >= effect.source.minimumPieces
  }
  return build.weapon.weaponId === effect.source.weaponId
}

/** Returns recipient-owned equipment effects that contribute to one explicitly typed metric modifier. */
function selectRecipientEquipmentEffects(
  effects: readonly ResolvedRecipientEquipmentEffect[],
  target: RecipientEquipmentEffect["target"]
): readonly ResolvedRecipientEquipmentEffect[] {
  return effects.filter((effect) => effect.target === target)
}

/** Sums one homogeneous recipient-side modifier after its equipment ownership has been resolved. */
function sumRecipientEquipmentEffectValues(effects: readonly ResolvedRecipientEquipmentEffect[]): number {
  return effects.reduce((total, effect) => total + effect.value, 0)
}

function evaluateRecipientRequirement(
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
function resolveMetricSourceCombatStats(
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

function evaluateHealingMetric(
  metric: CombatScaledHealingMetricDefinition,
  build: CharacterBuild,
  recipient: ResolvedFriendlyRecipient,
  sourceContext: CombatMetricSourceContext | undefined,
  teammates: readonly CharacterBuild[] | undefined,
  gameData: GameDataRepository
): CombatHealingMetricEvaluation {
  const stats = resolveMetricSourceCombatStats(metric, build, sourceContext, teammates, gameData)
  const percentage = resolveMetricParameter(metric, metric.percentageParameter, build, gameData)
  const flatAmount = resolveMetricParameter(metric, metric.flatParameter, build, gameData)
  if (percentage.talentLevel !== flatAmount.talentLevel) {
    throw new Error(`Combat metric ${metric.id} resolves its healing parameters at inconsistent talent levels`)
  }

  const scalingValue = getMetricScalingValue(metric.scalingStat, stats)
  const additionalScalingTerms = (metric.additionalScalingTerms ?? []).map((term) =>
    resolveHealingAdditionalScalingTerm(term, build, stats)
  )
  const sourceHealingBonuses = metric.includeHealingBonus
    ? (metric.sourceHealingBonuses ?? []).map((bonus) => resolveHealingSourceBonus(bonus, build, sourceContext))
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
    talentParameterTerm("单跳治疗百分比", metric.percentageParameter, percentage)
  ])
  const conditionalScalingBonuses = (metric.conditionalScalingBonuses ?? []).map((bonus) =>
    resolveConditionalHealingScalingBonus(metric, bonus, build, recipient, scalingValue)
  )
  const baseHealing = addFormula("基础单跳治疗", [
    sourceScaling,
    talentParameterTerm("单跳固定治疗", metric.flatParameter, flatAmount),
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
  const recipientIncomingHealingEffects = selectRecipientEquipmentEffects(
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
    flatAmount: flatAmount.value,
    formula,
    healingBonus,
    id: metric.id,
    incomingHealingBonus: recipient.incomingHealingBonus,
    kind: "healing",
    label: metric.label,
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

function evaluateFlatStatBuffMetric(
  metric: CombatFlatStatBuffMetricDefinition,
  build: CharacterBuild,
  recipient: ResolvedFriendlyRecipient,
  sourceContext: CombatMetricSourceContext | undefined,
  teammates: readonly CharacterBuild[] | undefined,
  gameData: GameDataRepository
): CombatFlatStatBuffMetricEvaluation {
  const stats = resolveMetricSourceCombatStats(metric, build, sourceContext, teammates, gameData)
  const ratio = resolveMetricParameter(metric, metric.ratioParameter, build, gameData)
  const ratioConstellationBonus = (metric.ratioConstellationBonuses ?? []).reduce(
    (total, bonus) => total + (build.constellation >= bonus.minimumConstellation ? bonus.value : 0),
    0
  )
  const scalingValue = getMetricScalingValue(metric.scalingStat, stats)
  const ratioOperands: CombatMetricFormulaNode[] = [
    talentParameterTerm("领域加攻倍率", metric.ratioParameter, ratio)
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
    label: metric.label,
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

function evaluateScalarMetric(
  metric: CombatScalarMetricDefinition,
  input: EvaluateCombatMetricInput
): CombatScalarMetricEvaluation {
  const stats = resolveMetricSourceCombatStats(
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
    ? resolveMetricParameter(metric, ratioParameterDefinition, input.build, input.gameData)
    : undefined
  const flatParameter = flatParameterDefinition
    ? resolveMetricParameter(metric, flatParameterDefinition, input.build, input.gameData)
    : undefined
  const maximumValueParameter = maximumValueParameterDefinition
    ? resolveMetricParameter(metric, maximumValueParameterDefinition, input.build, input.gameData)
    : undefined
  const ratioScenarioParameter = ratioScenarioParameterDefinition
    ? resolveMetricRatioScenarioParameter(metric, ratioScenarioParameterDefinition, input.build, input.context)
    : undefined
  const baseRatio = (metric.ratio ?? 0) + (ratioParameter?.value ?? 0)
  const ratio = baseRatio * (ratioScenarioParameter?.value ?? 1)
  const flatAmount = (metric.flat ?? 0) + (flatParameter?.value ?? 0)
  const operands: CombatMetricFormulaNode[] = []
  let scalingValue: number | undefined
  const ratioOperands: CombatMetricFormulaNode[] = []
  if (metric.ratio !== undefined) ratioOperands.push(constantTerm("固定倍率", metric.ratio))
  if (ratioParameter && ratioParameterDefinition) {
    ratioOperands.push(talentParameterTerm("天赋倍率", ratioParameterDefinition, ratioParameter))
  }
  const ratioFormula = addFormula("最终倍率", ratioOperands)
  const effectiveRatioFormula = ratioScenarioParameter
    ? multiplyFormula("动作快照后的倍率", [ratioFormula, actionScenarioParameterTerm(ratioScenarioParameter)])
    : ratioFormula

  if (metric.scalingStat) {
    scalingValue = getMetricScalingValue(metric.scalingStat, stats)
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
    operands.push(talentParameterTerm("天赋固定值", flatParameterDefinition, flatParameter))
  }

  const uncappedFormula = addFormula(metric.label, operands)
  const maximumValue = metric.maximumValue ?? maximumValueParameter?.value
  const maximumValueFormula = maximumValueParameter && maximumValueParameterDefinition
    ? talentParameterTerm("天赋效果上限", maximumValueParameterDefinition, maximumValueParameter)
    : maximumValue === undefined
      ? undefined
      : constantTerm("效果上限", maximumValue)
  const basePotentialFormula = maximumValueFormula
    ? minimumFormula("上限修正", [uncappedFormula, maximumValueFormula])
    : uncappedFormula
  const recipient = metric.target === "friendly_recipient" ? resolveFriendlyRecipient(metric, input) : undefined
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
  const sourceContribution = applySourceAscensionRequirement(
    metric.label,
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
    label: metric.label,
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
  return selectRecipientEquipmentEffects(recipient?.recipientEquipmentEffects ?? [], "shieldStrength")
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

function resolveHealingAdditionalScalingTerm(
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

function resolveHealingSourceBonus(
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

function applySourceAscensionRequirement(
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

function evaluateSourceHpFractionRequirement(
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

function resolveConditionalHealingScalingBonus(
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

function applyConditions(
  formula: CombatMetricFormulaNode,
  conditions: readonly CombatMetricConditionEvaluation[]
): CombatMetricFormulaNode {
  return conditions.reduce<CombatMetricFormulaNode>(
    (currentFormula, condition) => ({
      condition,
      kind: "condition",
      operand: currentFormula,
      satisfied: condition.satisfied,
      value: condition.satisfied ? currentFormula.value : 0
    }),
    formula
  )
}

function addFormula(label: string, operands: readonly CombatMetricFormulaNode[]): CombatMetricFormulaAdd {
  return { kind: "add", label, operands, value: operands.reduce((total, operand) => total + operand.value, 0) }
}

function multiplyFormula(label: string, operands: readonly CombatMetricFormulaNode[]): CombatMetricFormulaMultiply {
  return { kind: "multiply", label, operands, value: operands.reduce((total, operand) => total * operand.value, 1) }
}

function minimumFormula(
  label: string,
  operands: readonly [CombatMetricFormulaNode, CombatMetricFormulaNode]
): CombatMetricFormulaMinimum {
  return { kind: "minimum", label, operands, value: Math.min(operands[0].value, operands[1].value) }
}

function maximumFormula(
  label: string,
  operands: readonly [CombatMetricFormulaNode, CombatMetricFormulaNode]
): CombatMetricFormulaMaximum {
  return { kind: "maximum", label, operands, value: Math.max(operands[0].value, operands[1].value) }
}

function constantTerm(label: string, value: number): CombatMetricFormulaTerm {
  return { kind: "term", label, role: "constant", value }
}

function sourceStatTerm(stat: CombatMetricScalingStat, value: number): CombatMetricFormulaTerm {
  const labels: Readonly<Record<CombatMetricScalingStat, string>> = {
    attack: "攻击力",
    base_attack: "基础攻击力",
    defense: "防御力",
    elementalMastery: "元素精通",
    hp: "生命值"
  }
  const label = `来源${labels[stat]}`
  return { kind: "term", label, role: "source_stat", stat, value }
}

function talentParameterTerm(
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

function modifierTerm(
  role: Extract<CombatMetricFormulaTerm["role"], "recipient_modifier" | "source_modifier">,
  label: string,
  value: number
): CombatMetricFormulaTerm {
  return { kind: "term", label, role, value }
}

function recipientStateTerm(label: string, value: number): CombatMetricFormulaTerm {
  return { kind: "term", label, role: "recipient_state", value }
}

function actionScenarioParameterTerm(
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

function resolveMetricRatioScenarioParameter(
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

  const actionParameters = context?.actionParameters
  const value = actionParameters?.[parameter.parameterId] ?? definition.defaultValue
  const maximumValue = resolveActionScenarioParameterMaximum(sourceAction.id, definition, actionParameters)
  const isAllowedValue = definition.allowedValues?.includes(value) ?? true
  if (!Number.isInteger(value) || value < definition.minimumValue || value > maximumValue || !isAllowedValue) {
    throw new Error(`Metric ${metric.id} has invalid action snapshot ${parameter.parameterId}`)
  }
  const requiredConstellation = getScenarioParameterMinimumSourceConstellation(definition, value)
  if (requiredConstellation !== undefined && build.constellation < requiredConstellation) {
    throw new Error(
      `Metric ${metric.id} action snapshot ${parameter.parameterId}=${value} requires source constellation ` +
        `${requiredConstellation}`
    )
  }
  return { label: definition.label, parameterId: definition.id, value }
}

function resolveActionScenarioParameterMaximum(
  actionId: string,
  definition: NonNullable<NonNullable<ReturnType<typeof getCombatActionDefinition>>["scenarioParameters"]>[number],
  actionParameters: CombatMetricEvaluationContext["actionParameters"] | undefined
): number {
  const maximumByParameter = definition.maximumValueByParameter
  if (!maximumByParameter) return definition.maximumValue

  const sourceAction = getCombatActionDefinition(actionId)
  const dependency = sourceAction?.scenarioParameters?.find(
    (candidate) => candidate.id === maximumByParameter.parameterId
  )
  if (!dependency) throw new Error(`Action ${actionId} has an invalid maximum snapshot dependency`)
  const dependencyValue = actionParameters?.[dependency.id] ?? dependency.defaultValue
  const matchingMaximum = maximumByParameter.values.find((entry) => entry.parameterValue === dependencyValue)
  if (!matchingMaximum) throw new Error(`Action ${actionId} has an invalid maximum snapshot value`)
  return matchingMaximum.maximumValue
}

function resolveMetricParameter(
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

function getMetricTalentLevel(
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

function getMetricScalingValue(stat: CombatMetricScalingStat, stats: ResolvedCoreCombatStats): number {
  if (stat === "attack") return stats.attack
  if (stat === "base_attack") return stats.baseAttack
  if (stat === "defense") return stats.defense
  if (stat === "elementalMastery") return stats.elementalMastery
  return stats.hp
}
