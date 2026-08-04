import {
  characterCombatCoverageRegistry,
  reviewedMultiScalingEvidenceRegistry,
  type CharacterCombatCoverage,
  type CombatActionMetadata,
  type CombatDamageEventTemplate,
  type CombatDamagePart,
  type CombatElementOverrideEffect,
  type CombatMetricDefinition,
  type CombatMetricTalentParameter,
  type CombatParameterReference,
  type CombatTalentParameterGroupId,
  type CombatTalentParameterSlot,
  type ReviewedMultiScalingEvidenceRecord,
  type ReviewedMultiScalingEvidenceTerm
} from "@gscombat/content"
import type { GameDataRepository } from "@gscombat/game-data"

import { getTravelerTalentParameterOwnerIds } from "./build-variant.js"

/** Identifies a structural or snapshot-backed problem in a combat registry declaration. */
export type CombatRegistryIntegrityIssueCode =
  | "action-character-mismatch"
  | "additive-reaction-element-mismatch"
  | "conflicting-reaction-declarations"
  | "duplicate-action-id"
  | "duplicate-action-scenario-parameter-id"
  | "duplicate-character-id"
  | "duplicate-character-talent-level-constellation-bonus"
  | "duplicate-element-override-effect-id"
  | "duplicate-metric-id"
  | "duplicate-damage-event-id"
  | "duplicate-damage-part-id"
  | "invalid-damage-event-id"
  | "invalid-damage-event-scenario-parameter"
  | "invalid-damage-event-snapshot"
  | "invalid-damage-event-snapshot-time"
  | "invalid-damage-scaling-term"
  | "invalid-action-capped-stat-to-attack-conversion"
  | "invalid-action-intrinsic-effect"
  | "invalid-character-talent-level-constellation-bonus"
  | "invalid-character-talent-level-constellation-traveler-element"
  | "invalid-traveler-element-eligibility"
  | "invalid-declared-direct-scaling-shape"
  | "invalid-transformative-reaction-declaration"
  | "transformative-reaction-element-mismatch"
  | "invalid-element-override-effect"
  | "invalid-element-override-action"
  | "invalid-element-override-target"
  | "invalid-elemental-application-icd"
  | "invalid-elemental-application-reaction-bonus"
  | "invalid-action-scenario-parameter"
  | "invalid-action-scenario-parameter-reference"
  | "invalid-healing-metric-extension"
  | "invalid-metric-constellation-bonus"
  | "invalid-metric-action-scenario-parameter"
  | "invalid-metric-expression"
  | "invalid-metric-recipient-requirement"
  | "invalid-metric-recipient-target-routing"
  | "invalid-metric-scaling-stat"
  | "invalid-metric-target"
  | "invalid-scalar-metric-scope"
  | "invalid-damage-event-time"
  | "missing-damage-event-part"
  | "missing-damage-events"
  | "missing-damage-part-coefficient-reference"
  | "missing-declared-direct-damage-parts"
  | "missing-effect-duration-parameter"
  | "missing-metric-source-action"
  | "missing-metric-talent-parameter"
  | "missing-raw-parameter"
  | "missing-reviewed-multi-scaling-evidence"
  | "missing-snapshot-character"
  | "reviewed-multi-scaling-evidence-term-mismatch"
  | "reviewed-multi-scaling-evidence-source-mismatch"
  | "missing-talent-parameter-owner"
  | "missing-talent-parameter"
  | "effect-character-mismatch"
  | "effect-duration-snapshot-mismatch"
  | "effect-duration-reference-slot-mismatch"
  | "metric-action-mismatch"
  | "metric-character-mismatch"
  | "metric-parameter-snapshot-mismatch"
  | "metric-talent-reference-slot-mismatch"
  | "talent-coefficient-snapshot-mismatch"
  | "talent-reference-slot-mismatch"
  | "timeline-action-level-reaction-unsupported"
  | "timeline-unsupported-evaluator"
  | "unmapped-declared-damage-part"

/** Describes one actionable failure found while validating authored combat declarations. */
export interface CombatRegistryIntegrityIssue {
  readonly actionId?: string
  readonly actualCoefficient?: number
  readonly actualValue?: number
  readonly characterId: string
  readonly code: CombatRegistryIntegrityIssueCode
  readonly damageEventId?: string
  readonly damagePartId?: string
  readonly expectedCoefficient?: number
  readonly expectedValue?: number
  readonly effectId?: string
  readonly message: string
  readonly metricId?: string
  readonly parameterId?: string
  readonly talentLevel?: number
}

/** Returns every registry declaration error rather than stopping at the first authored mistake. */
export interface CombatRegistryIntegrityReport {
  readonly issues: readonly CombatRegistryIntegrityIssue[]
  readonly isValid: boolean
}

/** Supplies the pinned data snapshot and an optional alternate registry for validation. */
export interface ValidateCombatRegistryIntegrityInput {
  readonly gameData: GameDataRepository
  readonly registry?: readonly CharacterCombatCoverage[]
  readonly reviewedMultiScalingEvidence?: readonly ReviewedMultiScalingEvidenceRecord[]
}

const talentGroupsBySlot: Readonly<Record<CombatTalentParameterSlot, readonly CombatTalentParameterGroupId[]>> = {
  burst: ["burst"],
  normal: ["auto"],
  passive: ["passive", "passive1", "passive2", "passive3", "lockedPassive", "sprint"],
  skill: ["skill"]
}

const elementalOverrideElements = new Set(["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"])
const meleeWeaponTypes = new Set(["claymore", "polearm", "sword"])
const levelledTalentSlots = new Set(["normal", "skill", "burst"])
const travelerElements = new Set(["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"])

function isTalentParameterGroupCompatible(
  talentSlot: CombatTalentParameterSlot,
  groupId: CombatTalentParameterGroupId
): boolean {
  return talentGroupsBySlot[talentSlot]?.includes(groupId) ?? false
}

function expectedTalentGroups(talentSlot: CombatTalentParameterSlot): string {
  return talentGroupsBySlot[talentSlot]?.join(", ") ?? ""
}

function validateTravelerElementEligibility(
  action: CombatActionMetadata,
  issues: CombatRegistryIntegrityIssue[]
): boolean {
  if (action.travelerElement === undefined) return true

  let isValid = true
  if (action.characterId !== "Traveler") {
    issues.push({
      actionId: action.id,
      characterId: action.characterId,
      code: "invalid-traveler-element-eligibility",
      message: `Action ${action.id} can only declare travelerElement when it belongs to Traveler`
    })
    isValid = false
  }
  if (action.talentParameterOwnerId !== undefined) {
    issues.push({
      actionId: action.id,
      characterId: action.characterId,
      code: "invalid-traveler-element-eligibility",
      message: `Traveler element action ${action.id} cannot declare a fixed talent parameter owner`
    })
    isValid = false
  }
  return isValid
}

function getActionTalentParameterOwnerIds(action: CombatActionMetadata): readonly string[] {
  if (action.travelerElement === undefined) return [action.talentParameterOwnerId ?? action.characterId]
  if (action.characterId !== "Traveler" || action.talentParameterOwnerId !== undefined) return []
  return getTravelerTalentParameterOwnerIds(action.travelerElement)
}

/**
 * Validates authored combat declarations against the pinned game-data snapshot.
 *
 * A talent reference is checked through the normalized talent table at level one.
 * That establishes that its character, talent group, and parameter row exist without
 * conflating declaration integrity with a user's selected talent level at evaluation time.
 */
export function validateCombatRegistryIntegrity(
  input: ValidateCombatRegistryIntegrityInput
): CombatRegistryIntegrityReport {
  const registry = input.registry ?? characterCombatCoverageRegistry
  const reviewedMultiScalingEvidence =
    input.reviewedMultiScalingEvidence ?? reviewedMultiScalingEvidenceRegistry.records
  const issues: CombatRegistryIntegrityIssue[] = []
  const characterIds = new Set<string>()
  const actionIds = new Set<string>()
  const effectIds = new Set<string>()
  const metricIds = new Set<string>()

  for (const coverage of registry) {
    validateCoverageDeclaration(
      coverage,
      input.gameData,
      characterIds,
      actionIds,
      effectIds,
      metricIds,
      reviewedMultiScalingEvidence,
      issues
    )
  }

  return { issues, isValid: issues.length === 0 }
}

/** Throws one author-facing error if the combat registry is not structurally valid for the pinned snapshot. */
export function assertCombatRegistryIntegrity(input: ValidateCombatRegistryIntegrityInput): void {
  const report = validateCombatRegistryIntegrity(input)
  if (report.isValid) return

  const details = report.issues.map((issue) => `- [${issue.code}] ${issue.message}`).join("\n")
  throw new Error(`Combat registry integrity validation failed:\n${details}`)
}

function validateCoverageDeclaration(
  coverage: CharacterCombatCoverage,
  gameData: GameDataRepository,
  characterIds: Set<string>,
  actionIds: Set<string>,
  effectIds: Set<string>,
  metricIds: Set<string>,
  reviewedMultiScalingEvidence: readonly ReviewedMultiScalingEvidenceRecord[],
  issues: CombatRegistryIntegrityIssue[]
): void {
  if (characterIds.has(coverage.characterId)) {
    issues.push({
      characterId: coverage.characterId,
      code: "duplicate-character-id",
      message: `Character ${coverage.characterId} is declared more than once in the combat registry`
    })
  }
  characterIds.add(coverage.characterId)

  if (!gameData.getCharacter(coverage.characterId)) {
    issues.push({
      characterId: coverage.characterId,
      code: "missing-snapshot-character",
      message: `Character ${coverage.characterId} does not exist in the pinned game-data snapshot`
    })
  }

  validateCharacterTalentLevelConstellationBonuses(coverage, issues)

  for (const action of coverage.actions) {
    validateActionDeclaration(
      coverage.characterId,
      action,
      gameData,
      actionIds,
      reviewedMultiScalingEvidence,
      issues
    )
  }
  for (const metric of coverage.metrics ?? []) {
    validateMetricDeclaration(coverage, metric, gameData, metricIds, issues)
  }
  for (const effect of coverage.effects ?? []) {
    validateElementOverrideEffect(coverage.characterId, effect, gameData, effectIds, issues)
  }
}

function validateCharacterTalentLevelConstellationBonuses(
  coverage: CharacterCombatCoverage,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const seenBonusKeys = new Set<string>()
  for (const bonus of coverage.talentLevelConstellationBonuses ?? []) {
    const issueBase = { characterId: coverage.characterId }
    const isValidBonus =
      Number.isInteger(bonus.minimumSourceConstellation) &&
      bonus.minimumSourceConstellation >= 1 &&
      bonus.minimumSourceConstellation <= 6 &&
      Number.isInteger(bonus.value) &&
      bonus.value > 0 &&
      levelledTalentSlots.has(bonus.talentSlot)
    if (!isValidBonus) {
      issues.push({
        ...issueBase,
        code: "invalid-character-talent-level-constellation-bonus",
        message: `Character ${coverage.characterId} must declare a positive integer talent-level bonus at constellation one through six`
      })
    }

    const bonusKey = `${bonus.minimumSourceConstellation}:${bonus.talentSlot}:${bonus.travelerElement ?? "all"}`
    if (seenBonusKeys.has(bonusKey)) {
      issues.push({
        ...issueBase,
        code: "duplicate-character-talent-level-constellation-bonus",
        message: `Character ${coverage.characterId} declares duplicate talent-level constellation mapping ${bonusKey}`
      })
    }
    seenBonusKeys.add(bonusKey)

    if (
      bonus.travelerElement !== undefined &&
      (coverage.characterId !== "Traveler" || !travelerElements.has(bonus.travelerElement))
    ) {
      issues.push({
        ...issueBase,
        code: "invalid-character-talent-level-constellation-traveler-element",
        message: `Character ${coverage.characterId} may only declare a valid Traveler element on a Traveler constellation mapping`
      })
    }
  }
}

function validateMetricDeclaration(
  coverage: CharacterCombatCoverage,
  metric: CombatMetricDefinition,
  gameData: GameDataRepository,
  metricIds: Set<string>,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const issueBase = { characterId: coverage.characterId, metricId: metric.id }
  if (metric.characterId !== coverage.characterId) {
    issues.push({
      ...issueBase,
      code: "metric-character-mismatch",
      message: `Metric ${metric.id} declares ${metric.characterId}, but its coverage entry belongs to ${coverage.characterId}`
    })
  }
  if (metricIds.has(metric.id)) {
    issues.push({
      ...issueBase,
      code: "duplicate-metric-id",
      message: `Metric ID ${metric.id} is declared more than once in the combat registry`
    })
  }
  metricIds.add(metric.id)

  const sourceAction = coverage.actions.find((action) => action.id === metric.sourceActionId)
  if (!sourceAction) {
    issues.push({
      ...issueBase,
      code: "missing-metric-source-action",
      message: `Metric ${metric.id} references undeclared source action ${metric.sourceActionId}`
    })
    return
  }
  if (
    metric.kind === "damage" &&
    (metric.actionId !== sourceAction.id || sourceAction.kind !== "damage" || sourceAction.status !== "verified")
  ) {
    issues.push({
      ...issueBase,
      code: "metric-action-mismatch",
      message: `Damage metric ${metric.id} must source one verified damage action from the same coverage declaration`
    })
  }

  validateMetricTarget(metric, issues)
  validateMetricConstellationBonuses(metric, issues)
  if (metric.kind === "damage") return

  const talentParameterOwnerIds = getActionTalentParameterOwnerIds(sourceAction)
  const availableTalentParameterOwnerIds = talentParameterOwnerIds.filter((talentParameterOwnerId) => {
    if (gameData.listCharacterSkillParameterOwnerIds().includes(talentParameterOwnerId)) return true
    issues.push({
      ...issueBase,
      code: "missing-talent-parameter-owner",
      message: `Talent parameter owner ${talentParameterOwnerId} for metric ${metric.id} does not exist in the pinned snapshot`
    })
    return false
  })
  if (availableTalentParameterOwnerIds.length === 0) return

  if (metric.kind === "healing") {
    validateMetricScalingStat(
      metric.id,
      coverage.characterId,
      metric.scalingStat,
      ["attack", "defense", "elementalMastery", "hp"],
      issues
    )
    validateMetricTalentParameter(metric, metric.percentageParameter, availableTalentParameterOwnerIds, gameData, issues)
    validateMetricTalentParameter(metric, metric.flatParameter, availableTalentParameterOwnerIds, gameData, issues)
    validateHealingMetricExtensions(metric, issues)
    return
  }

  if (metric.kind === "scalar") {
    validateScalarMetricExpression(metric, issues)
    validateScalarMetricDamageScope(metric, issues)
    if (metric.scalingStat) {
      validateMetricScalingStat(
        metric.id,
        coverage.characterId,
        metric.scalingStat,
        ["attack", "base_attack", "defense", "elementalMastery", "hp"],
        issues
      )
    }
    if (metric.ratioParameter) {
      validateMetricTalentParameter(metric, metric.ratioParameter, availableTalentParameterOwnerIds, gameData, issues)
    }
    if (metric.flatParameter) {
      validateMetricTalentParameter(metric, metric.flatParameter, availableTalentParameterOwnerIds, gameData, issues)
    }
    if (metric.maximumValueParameter) {
      validateMetricTalentParameter(metric, metric.maximumValueParameter, availableTalentParameterOwnerIds, gameData, issues)
    }
    if (metric.ratioScenarioParameter) {
      validateMetricActionScenarioParameter(metric, sourceAction, issues)
    }
    return
  }

  validateMetricScalingStat(
    metric.id,
    coverage.characterId,
    metric.scalingStat,
    ["attack", "base_attack", "defense", "hp"],
    issues
  )
  validateMetricTalentParameter(metric, metric.ratioParameter, availableTalentParameterOwnerIds, gameData, issues)
}

function validateMetricTarget(metric: CombatMetricDefinition, issues: CombatRegistryIntegrityIssue[]): void {
  const issueBase = { characterId: metric.characterId, metricId: metric.id }
  if (metric.kind === "damage") {
    if (metric.target === "enemy") return
    issues.push({
      ...issueBase,
      code: "invalid-metric-target",
      message: `Damage metric ${issueBase.metricId} must target the enemy`
    })
    return
  }
  if (metric.kind === "scalar" && (metric.target === "enemy" || metric.target === "self")) return

  if (metric.target !== "friendly_recipient") {
    issues.push({
      ...issueBase,
      code: "invalid-metric-target",
      message: `Support metric ${issueBase.metricId} must target one explicit friendly recipient`
    })
    return
  }

  validateMetricRecipientRequirements(metric, issues)
  if (metric.kind === "scalar") validateMetricRecipientTargetRouting(metric, issues)
}

function validateMetricRecipientTargetRouting(
  metric: Extract<CombatMetricDefinition, { readonly kind: "scalar"; readonly target: "friendly_recipient" }>,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const routing = metric.recipientTargetRouting
  if (routing === undefined || routing === "active_recipient_if_moonsign_else_self") return
  issues.push({
    characterId: metric.characterId,
    code: "invalid-metric-recipient-target-routing",
    message: `Scalar metric ${metric.id} declares an unsupported friendly-recipient target route`,
    metricId: metric.id
  })
}

function validateMetricRecipientRequirements(
  metric: Extract<CombatMetricDefinition, { readonly target: "friendly_recipient" }>,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const issueBase = { characterId: metric.characterId, metricId: metric.id }
  for (const requirement of metric.recipientRequirements) {
    if (requirement.kind === "recipient_in_source_area" && requirement.label.trim().length > 0) continue
    if (
      requirement.kind === "recipient_hp_fraction" &&
      requirement.label.trim().length > 0 &&
      (requirement.comparison === "at_most" || requirement.comparison === "above") &&
      Number.isFinite(requirement.threshold) &&
      requirement.threshold >= 0 &&
      requirement.threshold <= 1 &&
      (requirement.waivedAtSourceConstellation === undefined ||
        isValidMetricConstellation(requirement.waivedAtSourceConstellation))
    ) {
      continue
    }
    issues.push({
      ...issueBase,
      code: "invalid-metric-recipient-requirement",
      message: `Metric ${metric.id} declares an invalid friendly-recipient requirement`
    })
  }
}

function validateScalarMetricExpression(
  metric: Extract<CombatMetricDefinition, { readonly kind: "scalar" }>,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const hasRatio = metric.ratio !== undefined || metric.ratioParameter !== undefined
  const hasFlat = metric.flat !== undefined || metric.flatParameter !== undefined
  const hasScaling = metric.scalingStat !== undefined
  const finiteValues = [metric.flat, metric.ratio, metric.maximumValue, metric.minimumScalingValue]
    .filter((value): value is number => value !== undefined)
    .every(Number.isFinite)
  const validLimits =
    (metric.maximumValue === undefined || metric.maximumValue >= 0) &&
    (metric.minimumScalingValue === undefined || metric.minimumScalingValue >= 0) &&
    (metric.minimumSourceAscension === undefined || isValidMetricAscension(metric.minimumSourceAscension))
  const hasConflictingMaximum = metric.maximumValue !== undefined && metric.maximumValueParameter !== undefined

  const hasValidContribution = hasScaling ? hasRatio : hasFlat || hasRatio

  if (finiteValues && validLimits && !hasConflictingMaximum && hasValidContribution) return
  issues.push({
    characterId: metric.characterId,
    code: "invalid-metric-expression",
    message:
      `Scalar metric ${metric.id} needs a finite direct contribution or a source stat paired with a finite ratio, ` +
      "and all limits must be non-negative with at most one fixed or talent-derived maximum",
    metricId: metric.id
  })
}

function validateMetricActionScenarioParameter(
  metric: Extract<CombatMetricDefinition, { readonly kind: "scalar" }>,
  sourceAction: CombatActionMetadata,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const parameterId = metric.ratioScenarioParameter?.parameterId
  if (!parameterId) return
  const exists = sourceAction.scenarioParameters?.some((parameter) => parameter.id === parameterId) ?? false
  if (exists) return
  issues.push({
    characterId: metric.characterId,
    code: "invalid-metric-action-scenario-parameter",
    message: `Scalar metric ${metric.id} references undeclared source-action snapshot ${parameterId}`,
    metricId: metric.id
  })
}

function validateHealingMetricExtensions(
  metric: Extract<CombatMetricDefinition, { readonly kind: "healing" }>,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const additionalScalingTerms = metric.additionalScalingTerms ?? []
  const sourceHealingBonuses = metric.sourceHealingBonuses ?? []
  const conditionalScalingBonuses = metric.conditionalScalingBonuses ?? []
  const validAdditionalScalingTerms = additionalScalingTerms.every(
    (term) =>
      term.label.trim().length > 0 &&
      Number.isFinite(term.ratio) &&
      term.ratio >= 0 &&
      ["attack", "defense", "elementalMastery", "hp"].includes(term.scalingStat) &&
      (term.minimumSourceAscension === undefined || isValidMetricAscension(term.minimumSourceAscension))
  )
  const validSourceHealingBonuses = sourceHealingBonuses.every((bonus) => {
    const requirement = bonus.sourceRequirement
    return (
      bonus.label.trim().length > 0 &&
      Number.isFinite(bonus.value) &&
      bonus.value >= 0 &&
      (bonus.minimumSourceAscension === undefined || isValidMetricAscension(bonus.minimumSourceAscension)) &&
      (requirement === undefined ||
        (requirement.kind === "source_hp_fraction" &&
          requirement.label.trim().length > 0 &&
          (requirement.comparison === "at_most" || requirement.comparison === "above") &&
          Number.isFinite(requirement.threshold) &&
          requirement.threshold >= 0 &&
          requirement.threshold <= 1))
    )
  })
  const validConditionalScalingBonuses = conditionalScalingBonuses.every((bonus) => {
    const requirement = bonus.recipientRequirement
    return (
      bonus.label.trim().length > 0 &&
      isValidMetricConstellation(bonus.minimumSourceConstellation) &&
      Number.isFinite(bonus.ratio) &&
      bonus.ratio >= 0 &&
      requirement.kind === "recipient_hp_fraction" &&
      requirement.label.trim().length > 0 &&
      (requirement.comparison === "at_most" || requirement.comparison === "above") &&
      requirement.threshold >= 0 &&
      requirement.threshold <= 1 &&
      requirement.waivedAtSourceConstellation === undefined
    )
  })
  if (metric.includeHealingBonus && validAdditionalScalingTerms && validSourceHealingBonuses && validConditionalScalingBonuses) {
    return
  }
  if (
    !metric.includeHealingBonus &&
    sourceHealingBonuses.length === 0 &&
    validAdditionalScalingTerms &&
    validConditionalScalingBonuses
  ) {
    return
  }
  issues.push({
    characterId: metric.characterId,
    code: "invalid-healing-metric-extension",
    message:
      `Healing metric ${metric.id} must use valid source-stat additions and finite non-negative kit healing bonuses ` +
      "only with healing bonuses enabled, plus valid conditional source-scaling bonuses",
    metricId: metric.id
  })
}

function validateScalarMetricDamageScope(
  metric: Extract<CombatMetricDefinition, { readonly kind: "scalar" }>,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const hasScope = metric.affectedElement !== undefined || metric.appliesTo !== undefined
  const isElementalFlatDamageBonus = metric.semantic === "elemental_flat_damage_bonus"
  const isElementalNormalAttackDamageBonus = metric.semantic === "elemental_normal_attack_damage_bonus"
  const isNormalAndChargedAttackDamageBonus = metric.semantic === "normal_and_charged_attack_damage_bonus"
  if (!isElementalFlatDamageBonus && !isElementalNormalAttackDamageBonus && !isNormalAndChargedAttackDamageBonus) {
    if (!hasScope) return
    issues.push({
      characterId: metric.characterId,
      code: "invalid-scalar-metric-scope",
      message: `Scalar metric ${metric.id} only declares affected damage scope for a scoped damage-bonus output`,
      metricId: metric.id
    })
    return
  }
  const appliesTo = metric.appliesTo ?? []
  if (isNormalAndChargedAttackDamageBonus) {
    const isNormalAndChargedAttackOnly =
      appliesTo.length === 2 && appliesTo.includes("normal") && appliesTo.includes("charged")
    if (metric.affectedElement === undefined && metric.unit === "ratio" && isNormalAndChargedAttackOnly) return
    issues.push({
      characterId: metric.characterId,
      code: "invalid-scalar-metric-scope",
      message:
        `Normal-and-charged damage-bonus metric ${metric.id} requires ratio units, no fixed element, ` +
        "and exactly the normal and charged damage categories",
      metricId: metric.id
    })
    return
  }
  if (isElementalNormalAttackDamageBonus) {
    const isNormalAttackOnly = appliesTo.length === 1 && appliesTo[0] === "normal"
    if (metric.affectedElement === undefined && metric.unit === "ratio" && isNormalAttackOnly) return
    issues.push({
      characterId: metric.characterId,
      code: "invalid-scalar-metric-scope",
      message:
        `Elemental normal-attack damage-bonus metric ${metric.id} requires ratio units, no fixed element, ` +
        "and exactly the normal-attack damage category",
      metricId: metric.id
    })
    return
  }
  const validAffectedElement =
    metric.affectedElement === "anemo" ||
    metric.affectedElement === "cryo" ||
    metric.affectedElement === "dendro" ||
    metric.affectedElement === "electro" ||
    metric.affectedElement === "geo" ||
    metric.affectedElement === "hydro" ||
    metric.affectedElement === "pyro"
  const validAppliesTo =
    appliesTo.length > 0 &&
    new Set(appliesTo).size === appliesTo.length &&
    appliesTo.every((type) => ["normal", "charged", "plunge", "skill", "burst"].includes(type))
  if (validAffectedElement && validAppliesTo) return
  issues.push({
    characterId: metric.characterId,
    code: "invalid-scalar-metric-scope",
    message: `Elemental flat-damage metric ${metric.id} requires one elemental scope and non-empty unique damage categories`,
    metricId: metric.id
  })
}

function validateMetricConstellationBonuses(
  metric: CombatMetricDefinition,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const issueBase = { characterId: metric.characterId, metricId: metric.id }
  if (metric.kind !== "stat_buff") return
  for (const bonus of metric.ratioConstellationBonuses ?? []) {
    if (isValidMetricConstellation(bonus.minimumConstellation) && Number.isFinite(bonus.value)) continue
    issues.push({
      ...issueBase,
      code: "invalid-metric-constellation-bonus",
      message: `Metric ${metric.id} must declare finite ratio bonuses at constellation one through six`
    })
  }
}

function isValidMetricConstellation(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 6
}

function isValidMetricAscension(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 6
}

function validateMetricScalingStat(
  metricId: string,
  characterId: string,
  scalingStat: string,
  allowedScalingStats: readonly string[],
  issues: CombatRegistryIntegrityIssue[]
): void {
  if (allowedScalingStats.includes(scalingStat)) return
  issues.push({
    characterId,
    code: "invalid-metric-scaling-stat",
    message: `Metric ${metricId} declares unsupported scaling stat ${scalingStat}`,
    metricId
  })
}

function validateMetricTalentParameter(
  metric: Exclude<CombatMetricDefinition, { readonly kind: "damage" }>,
  parameter: CombatMetricTalentParameter,
  talentParameterOwnerIds: readonly string[],
  gameData: GameDataRepository,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const reference = parameter.reference
  const issueBase = { characterId: metric.characterId, metricId: metric.id, parameterId: reference.id }
  if (!isTalentParameterGroupCompatible(reference.talentSlot, reference.groupId)) {
    issues.push({
      ...issueBase,
      code: "metric-talent-reference-slot-mismatch",
      message:
        `Metric parameter ${reference.id} for ${metric.id} uses ${reference.groupId}, expected one of ` +
        `${expectedTalentGroups(reference.talentSlot)} for ${reference.talentSlot}`
    })
  }

  for (const talentParameterOwnerId of talentParameterOwnerIds) {
    const levelOneValue = gameData.getCharacterSkillParameter(
      talentParameterOwnerId,
      reference.groupId,
      reference.parameterIndex,
      1
    )
    if (levelOneValue === undefined) {
      issues.push({
        ...issueBase,
        code: "missing-metric-talent-parameter",
        message: `Metric parameter ${reference.id} for ${metric.id} is missing from ${talentParameterOwnerId}`
      })
    }

    for (const check of parameter.snapshotChecks) {
      const actualValue = gameData.getCharacterSkillParameter(
        talentParameterOwnerId,
        reference.groupId,
        reference.parameterIndex,
        check.talentLevel
      )
      if (actualValue === check.expectedValue) continue
      issues.push({
        ...issueBase,
        ...(actualValue === undefined ? {} : { actualValue }),
        code: "metric-parameter-snapshot-mismatch",
        expectedValue: check.expectedValue,
        message:
          `Metric parameter ${reference.id} for ${metric.id} at level ${check.talentLevel} is expected to be ` +
          `${check.expectedValue}, but ${talentParameterOwnerId} contains ${actualValue ?? "no value"}`,
        talentLevel: check.talentLevel
      })
    }
  }
}

function validateElementOverrideEffect(
  coverageCharacterId: string,
  effect: CombatElementOverrideEffect,
  gameData: GameDataRepository,
  effectIds: Set<string>,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const issueBase = { characterId: coverageCharacterId, effectId: effect.id }
  if (effect.sourceCharacterId !== coverageCharacterId) {
    issues.push({
      ...issueBase,
      code: "effect-character-mismatch",
      message:
        `Element override effect ${effect.id} declares source ${effect.sourceCharacterId}, but its coverage entry ` +
        `belongs to ${coverageCharacterId}`
    })
  }
  if (effectIds.has(effect.id)) {
    issues.push({
      ...issueBase,
      code: "duplicate-element-override-effect-id",
      message: `Element override effect ID ${effect.id} is declared more than once in the combat registry`
    })
  }
  effectIds.add(effect.id)

  if (!gameData.getCharacter(effect.sourceCharacterId)) {
    issues.push({
      ...issueBase,
      code: "missing-snapshot-character",
      message: `Element override effect ${effect.id} source ${effect.sourceCharacterId} does not exist in the pinned snapshot`
    })
    return
  }
  if (
    effect.target !== "normal_attack" ||
    !elementalOverrideElements.has(effect.element) ||
    !Array.isArray(effect.eligibleWeaponTypes) ||
    effect.eligibleWeaponTypes.length === 0 ||
    effect.eligibleWeaponTypes.some((weaponType) => !meleeWeaponTypes.has(weaponType))
  ) {
    issues.push({
      ...issueBase,
      code: "invalid-element-override-effect",
      message: `Element override effect ${effect.id} must target eligible melee normal attacks with a non-Physical element`
    })
  }
  if (
    effect.minimumSourceConstellation !== undefined &&
    (!Number.isInteger(effect.minimumSourceConstellation) ||
      effect.minimumSourceConstellation < 0 ||
      effect.minimumSourceConstellation > 6)
  ) {
    issues.push({
      ...issueBase,
      code: "invalid-element-override-effect",
      message: `Element override effect ${effect.id} must declare a source constellation from 0 through 6`
    })
  }

  validateEffectDuration(coverageCharacterId, effect, gameData, issues)
}

function validateEffectDuration(
  characterId: string,
  effect: CombatElementOverrideEffect,
  gameData: GameDataRepository,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const parameter = effect.durationParameter
  const issueBase = { characterId, effectId: effect.id }
  if (!isTalentParameterGroupCompatible(parameter.talentSlot, parameter.groupId)) {
    issues.push({
      ...issueBase,
      code: "effect-duration-reference-slot-mismatch",
      message:
        `Duration parameter ${parameter.id} for effect ${effect.id} uses ${parameter.groupId}, expected one of ` +
        `${expectedTalentGroups(parameter.talentSlot)} for ${parameter.talentSlot}`,
      parameterId: parameter.id
    })
  }
  const levelOneValue = gameData.getCharacterSkillParameter(
    effect.sourceCharacterId,
    parameter.groupId,
    parameter.parameterIndex,
    1
  )
  if (levelOneValue === undefined) {
    issues.push({
      ...issueBase,
      code: "missing-effect-duration-parameter",
      message: `Duration parameter ${parameter.id} for effect ${effect.id} is missing from the pinned snapshot`,
      parameterId: parameter.id
    })
    return
  }

  for (const check of effect.durationChecks) {
    const actualCoefficient = gameData.getCharacterSkillParameter(
      effect.sourceCharacterId,
      parameter.groupId,
      parameter.parameterIndex,
      check.talentLevel
    )
    if (actualCoefficient === check.expectedCoefficient) continue
    issues.push({
      ...issueBase,
      ...(actualCoefficient === undefined ? {} : { actualCoefficient }),
      code: "effect-duration-snapshot-mismatch",
      expectedCoefficient: check.expectedCoefficient,
      message:
        `Duration parameter ${parameter.id} for effect ${effect.id} at level ${check.talentLevel} is expected ` +
        `to be ${check.expectedCoefficient}, but ${effect.sourceCharacterId} contains ${actualCoefficient ?? "no value"}`,
      parameterId: parameter.id,
      talentLevel: check.talentLevel
    })
  }
}

function validateActionDeclaration(
  coverageCharacterId: string,
  action: CombatActionMetadata,
  gameData: GameDataRepository,
  actionIds: Set<string>,
  reviewedMultiScalingEvidence: readonly ReviewedMultiScalingEvidenceRecord[],
  issues: CombatRegistryIntegrityIssue[]
): void {
  if (action.characterId !== coverageCharacterId) {
    issues.push({
      actionId: action.id,
      characterId: coverageCharacterId,
      code: "action-character-mismatch",
      message: `Action ${action.id} declares ${action.characterId}, but its coverage entry belongs to ${coverageCharacterId}`
    })
  }

  if (actionIds.has(action.id)) {
    issues.push({
      actionId: action.id,
      characterId: coverageCharacterId,
      code: "duplicate-action-id",
      message: `Action ID ${action.id} is declared more than once in the combat registry`
    })
  }
  actionIds.add(action.id)

  validateReactionDeclarations(coverageCharacterId, action, issues)
  if (!validateTravelerElementEligibility(action, issues)) return

  const talentParameterOwnerIds = getActionTalentParameterOwnerIds(action)
  const availableTalentParameterOwnerIds = talentParameterOwnerIds.filter((talentParameterOwnerId) => {
    if (gameData.listCharacterSkillParameterOwnerIds().includes(talentParameterOwnerId)) return true
    issues.push({
      actionId: action.id,
      characterId: coverageCharacterId,
      code: "missing-talent-parameter-owner",
      message: `Talent parameter owner ${talentParameterOwnerId} for action ${action.id} does not exist in the pinned snapshot`
    })
    return false
  })
  if (availableTalentParameterOwnerIds.length === 0) return

  for (const reference of action.parameterReferences ?? []) {
    validateParameterReference(
      coverageCharacterId,
      availableTalentParameterOwnerIds,
      action,
      reference,
      gameData,
      issues
    )
  }
  validateActionCappedStatToAttackConversion(
    coverageCharacterId,
    availableTalentParameterOwnerIds,
    action,
    gameData,
    issues
  )
  const scenarioParameters = validateActionScenarioParameters(coverageCharacterId, action, issues)
  validateActionIntrinsicEffects(
    coverageCharacterId,
    availableTalentParameterOwnerIds,
    action,
    scenarioParameters,
    gameData,
    issues
  )

  validateDeclaredDirectDamageParts(
    coverageCharacterId,
    availableTalentParameterOwnerIds,
    action,
    gameData,
    reviewedMultiScalingEvidence,
    scenarioParameters,
    issues
  )
  validateActionTimeline(
    coverageCharacterId,
    availableTalentParameterOwnerIds,
    action,
    scenarioParameters,
    gameData,
    issues
  )
}

function validateActionScenarioParameters(
  characterId: string,
  action: CombatActionMetadata,
  issues: CombatRegistryIntegrityIssue[]
): ReadonlyMap<string, NonNullable<CombatActionMetadata["scenarioParameters"]>[number]> {
  const definitions = action.scenarioParameters ?? []
  const definitionsById = new Map<string, NonNullable<CombatActionMetadata["scenarioParameters"]>[number]>()
  for (const definition of definitions) {
    if (definitionsById.has(definition.id)) {
      issues.push({
        actionId: action.id,
        characterId,
        code: "duplicate-action-scenario-parameter-id",
        message: `Action ${action.id} declares scenario parameter ${definition.id} more than once`,
        parameterId: definition.id
      })
      continue
    }
    definitionsById.set(definition.id, definition)
    validateActionScenarioParameterDefinition(characterId, action, definition, issues)
  }

  for (const definition of definitionsById.values()) {
    const maximumByParameter = definition.maximumValueByParameter
    if (!maximumByParameter) continue
    const source = definitionsById.get(maximumByParameter.parameterId)
    if (!source) {
      issues.push({
        actionId: action.id,
        characterId,
        code: "invalid-action-scenario-parameter-reference",
        message:
          `Scenario parameter ${definition.id} for action ${action.id} references undeclared parameter ` +
          `${maximumByParameter.parameterId}`,
        parameterId: definition.id
      })
      continue
    }
    const maximumsBySourceValue = new Map<number, number>()
    for (const entry of maximumByParameter.values) {
      if (!Number.isInteger(entry.parameterValue) || !Number.isInteger(entry.maximumValue)) {
        issues.push({
          actionId: action.id,
          characterId,
          code: "invalid-action-scenario-parameter",
          message: `Scenario parameter ${definition.id} for action ${action.id} has non-integer dependent bounds`,
          parameterId: definition.id
        })
        continue
      }
      if (maximumsBySourceValue.has(entry.parameterValue)) {
        issues.push({
          actionId: action.id,
          characterId,
          code: "invalid-action-scenario-parameter",
          message: `Scenario parameter ${definition.id} for action ${action.id} repeats a dependent bound`,
          parameterId: definition.id
        })
        continue
      }
      if (entry.maximumValue < definition.minimumValue || entry.maximumValue > definition.maximumValue) {
        issues.push({
          actionId: action.id,
          characterId,
          code: "invalid-action-scenario-parameter",
          message: `Scenario parameter ${definition.id} for action ${action.id} has an out-of-range dependent maximum`,
          parameterId: definition.id
        })
      }
      maximumsBySourceValue.set(entry.parameterValue, entry.maximumValue)
    }
    for (const sourceValue of getActionScenarioParameterValues(source)) {
      if (maximumsBySourceValue.has(sourceValue)) continue
      issues.push({
        actionId: action.id,
        characterId,
        code: "invalid-action-scenario-parameter-reference",
        message:
          `Scenario parameter ${definition.id} for action ${action.id} has no dependent maximum for ` +
          `${maximumByParameter.parameterId}=${sourceValue}`,
        parameterId: definition.id
      })
    }
  }
  return definitionsById
}

function validateActionIntrinsicEffects(
  characterId: string,
  talentParameterOwnerIds: readonly string[],
  action: CombatActionMetadata,
  scenarioParameters: ReadonlyMap<string, NonNullable<CombatActionMetadata["scenarioParameters"]>[number]>,
  gameData: GameDataRepository,
  issues: CombatRegistryIntegrityIssue[]
): void {
  for (const effect of action.intrinsicEffects ?? []) {
    validateActionIntrinsicEffect(
      characterId,
      talentParameterOwnerIds,
      action,
      effect,
      scenarioParameters,
      gameData,
      issues
    )
  }
}

function validateActionIntrinsicEffect(
  characterId: string,
  talentParameterOwnerIds: readonly string[],
  action: CombatActionMetadata,
  effect: NonNullable<CombatActionMetadata["intrinsicEffects"]>[number],
  scenarioParameters: ReadonlyMap<string, NonNullable<CombatActionMetadata["scenarioParameters"]>[number]>,
  gameData: GameDataRepository,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const issueBase = { actionId: action.id, characterId }
  if (!isVerifiedDeclaredDirectDamageAction(action)) {
    issues.push({
      ...issueBase,
      code: "invalid-action-intrinsic-effect",
      message: `Action ${action.id} can only declare intrinsic effects on verified declared direct damage`
    })
    return
  }
  if (
    !["critRate", "damageBonus", "elementalMastery"].includes(effect.target) ||
    (effect.minimumSourceAscension !== undefined && !isValidMetricAscension(effect.minimumSourceAscension))
  ) {
    issues.push({
      ...issueBase,
      code: "invalid-action-intrinsic-effect",
      message: `Intrinsic effect for action ${action.id} has an invalid target or source ascension requirement`
    })
  }
  validateIntrinsicEffectScenarioMultiplier(action, effect, scenarioParameters, issues)
  if (effect.kind === "flat") {
    const hasCoefficient = effect.coefficientParameterId !== undefined
    const hasFixedValue = effect.fixedValue !== undefined
    if (
      hasCoefficient === hasFixedValue ||
      (effect.fixedValue !== undefined && !Number.isFinite(effect.fixedValue)) ||
      (effect.valueMultiplier !== undefined &&
        (!Number.isFinite(effect.valueMultiplier) || effect.valueMultiplier < 0))
    ) {
      issues.push({
        ...issueBase,
        code: "invalid-action-intrinsic-effect",
        message: `Flat intrinsic effect for action ${action.id} must declare one finite source value and multiplier`
      })
      return
    }
    if (!effect.coefficientParameterId) return
    validateIntrinsicEffectParameter(
      characterId,
      talentParameterOwnerIds,
      action,
      "intrinsic-flat",
      effect.coefficientParameterId,
      effect.snapshotChecks,
      gameData,
      issues
    )
    return
  }

  if (
    !["attack", "defense", "elementalMastery", "hp"].includes(effect.sourceStat) ||
    (effect.maximumValue !== undefined && (!Number.isFinite(effect.maximumValue) || effect.maximumValue < 0)) ||
    (effect.maximumValue !== undefined && effect.maximumValueParameterId !== undefined) ||
    (effect.valueMultiplier !== undefined &&
      (!Number.isFinite(effect.valueMultiplier) || effect.valueMultiplier < 0))
  ) {
    issues.push({
      ...issueBase,
      code: "invalid-action-intrinsic-effect",
      message: `Source-stat intrinsic effect for action ${action.id} has an invalid target, source stat, or multiplier`
    })
    return
  }
  validateIntrinsicEffectParameter(
    characterId,
    talentParameterOwnerIds,
    action,
    "intrinsic-source-stat-coefficient",
    effect.coefficientParameterId,
    effect.snapshotChecks,
    gameData,
    issues
  )
  validateIntrinsicEffectParameter(
    characterId,
    talentParameterOwnerIds,
    action,
    "intrinsic-source-stat-offset",
    effect.sourceStatOffsetParameterId,
    effect.sourceStatOffsetSnapshotChecks,
    gameData,
    issues
  )
  validateIntrinsicEffectParameter(
    characterId,
    talentParameterOwnerIds,
    action,
    "intrinsic-source-stat-maximum",
    effect.sourceStatMaximumParameterId,
    effect.sourceStatMaximumSnapshotChecks,
    gameData,
    issues
  )
  validateIntrinsicEffectParameter(
    characterId,
    talentParameterOwnerIds,
    action,
    "intrinsic-maximum-value",
    effect.maximumValueParameterId,
    effect.maximumValueSnapshotChecks,
    gameData,
    issues
  )
}

function validateIntrinsicEffectScenarioMultiplier(
  action: CombatActionMetadata,
  effect: NonNullable<CombatActionMetadata["intrinsicEffects"]>[number],
  scenarioParameters: ReadonlyMap<string, NonNullable<CombatActionMetadata["scenarioParameters"]>[number]>,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const multiplier = effect.scenarioParameterMultiplier
  if (!multiplier) return
  const definition = scenarioParameters.get(multiplier.parameterId)
  const issueBase = { actionId: action.id, characterId: action.characterId }
  if (!definition) {
    issues.push({
      ...issueBase,
      code: "invalid-action-intrinsic-effect",
      message: `Intrinsic effect for action ${action.id} references undeclared scenario parameter ${multiplier.parameterId}`,
      parameterId: multiplier.parameterId
    })
    return
  }
  if (!("values" in multiplier)) {
    if (
      !Number.isFinite(multiplier.base) ||
      multiplier.base < 0 ||
      !Number.isFinite(multiplier.perParameterValue) ||
      multiplier.perParameterValue < 0
    ) {
      issues.push({
        ...issueBase,
        code: "invalid-action-intrinsic-effect",
        message: `Intrinsic effect for action ${action.id} has an invalid linear scenario multiplier`,
        parameterId: multiplier.parameterId
      })
    }
    return
  }
  const values = new Map<number, number>()
  for (const entry of multiplier.values) {
    if (!Number.isInteger(entry.parameterValue) || !Number.isFinite(entry.multiplier) || entry.multiplier < 0) {
      issues.push({
        ...issueBase,
        code: "invalid-action-intrinsic-effect",
        message: `Intrinsic effect for action ${action.id} has an invalid scenario multiplier value`,
        parameterId: multiplier.parameterId
      })
      continue
    }
    if (values.has(entry.parameterValue)) {
      issues.push({
        ...issueBase,
        code: "invalid-action-intrinsic-effect",
        message: `Intrinsic effect for action ${action.id} repeats a scenario multiplier value`,
        parameterId: multiplier.parameterId
      })
      continue
    }
    values.set(entry.parameterValue, entry.multiplier)
  }
  for (const parameterValue of getActionScenarioParameterValues(definition)) {
    if (values.has(parameterValue)) continue
    issues.push({
      ...issueBase,
      code: "invalid-action-intrinsic-effect",
      message:
        `Intrinsic effect for action ${action.id} has no multiplier for ` +
        `${multiplier.parameterId}=${parameterValue}`,
      parameterId: multiplier.parameterId
    })
  }
}

function validateIntrinsicEffectParameter(
  characterId: string,
  talentParameterOwnerIds: readonly string[],
  action: CombatActionMetadata,
  label: string,
  parameterId: string | undefined,
  snapshotChecks: readonly { readonly expectedCoefficient: number; readonly talentLevel: number }[] | undefined,
  gameData: GameDataRepository,
  issues: CombatRegistryIntegrityIssue[]
): void {
  if (!parameterId) return
  const reference = getTalentReference(action, parameterId)
  if (!reference) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "invalid-action-intrinsic-effect",
      message: `Intrinsic effect ${label} ${parameterId} for action ${action.id} must reference one declared talent parameter`,
      parameterId
    })
    return
  }
  for (const talentParameterOwnerId of talentParameterOwnerIds) {
    validateDamagePartSnapshotChecks(
      characterId,
      talentParameterOwnerId,
      action,
      label,
      snapshotChecks,
      reference,
      gameData,
      issues
    )
  }
}

function validateActionCappedStatToAttackConversion(
  characterId: string,
  talentParameterOwnerIds: readonly string[],
  action: CombatActionMetadata,
  gameData: GameDataRepository,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const conversion = action.cappedStatToAttackConversion
  if (!conversion) return
  if (!isVerifiedDeclaredDirectDamageAction(action) || action.scalingStat !== "attack") {
    issues.push({
      actionId: action.id,
      characterId,
      code: "invalid-action-capped-stat-to-attack-conversion",
      message:
        `Action ${action.id} can only declare a capped stat-to-Attack conversion on verified ` +
        "declared direct Attack-scaled damage"
    })
    return
  }

  validateCappedStatToAttackConversionParameter(
    characterId,
    talentParameterOwnerIds,
    action,
    "ratio",
    conversion.ratioParameterId,
    conversion.ratioSnapshotChecks,
    gameData,
    issues
  )
  validateCappedStatToAttackConversionParameter(
    characterId,
    talentParameterOwnerIds,
    action,
    "cap ratio",
    conversion.capRatioParameterId,
    conversion.capRatioSnapshotChecks,
    gameData,
    issues
  )
}

function validateCappedStatToAttackConversionParameter(
  characterId: string,
  talentParameterOwnerIds: readonly string[],
  action: CombatActionMetadata,
  label: "ratio" | "cap ratio",
  parameterId: string,
  snapshotChecks: readonly { readonly expectedCoefficient: number; readonly talentLevel: number }[] | undefined,
  gameData: GameDataRepository,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const reference = getTalentReference(action, parameterId)
  if (!reference) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "invalid-action-capped-stat-to-attack-conversion",
      message:
        `Capped stat-to-Attack conversion ${label} ${parameterId} for action ${action.id} ` +
        "must reference one declared talent parameter",
      parameterId
    })
    return
  }
  for (const talentParameterOwnerId of talentParameterOwnerIds) {
    validateDamagePartSnapshotChecks(
      characterId,
      talentParameterOwnerId,
      action,
      `capped-stat-to-attack-conversion-${label.replace(" ", "-")}`,
      snapshotChecks,
      reference,
      gameData,
      issues
    )
  }
}

function validateActionScenarioParameterDefinition(
  characterId: string,
  action: CombatActionMetadata,
  definition: NonNullable<CombatActionMetadata["scenarioParameters"]>[number],
  issues: CombatRegistryIntegrityIssue[]
): void {
  const isValidBounds =
    definition.id.trim().length > 0 &&
    definition.label.trim().length > 0 &&
    Number.isInteger(definition.minimumValue) &&
    Number.isInteger(definition.maximumValue) &&
    Number.isInteger(definition.defaultValue) &&
    definition.minimumValue <= definition.maximumValue &&
    definition.defaultValue >= definition.minimumValue &&
    definition.defaultValue <= definition.maximumValue
  if (!isValidBounds) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "invalid-action-scenario-parameter",
      message: `Scenario parameter ${definition.id} for action ${action.id} has invalid integer bounds or default`,
      parameterId: definition.id
    })
  }
  if (!definition.allowedValues) return
  const allowedValues = new Set<number>()
  for (const value of definition.allowedValues) {
    const isValidValue =
      Number.isInteger(value) && value >= definition.minimumValue && value <= definition.maximumValue
    if (!isValidValue || allowedValues.has(value)) {
      issues.push({
        actionId: action.id,
        characterId,
        code: "invalid-action-scenario-parameter",
        message: `Scenario parameter ${definition.id} for action ${action.id} has invalid allowed values`,
        parameterId: definition.id
      })
      continue
    }
    allowedValues.add(value)
  }
  if (!allowedValues.has(definition.defaultValue)) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "invalid-action-scenario-parameter",
      message: `Scenario parameter ${definition.id} for action ${action.id} excludes its default from allowed values`,
      parameterId: definition.id
    })
  }
}

function getActionScenarioParameterValues(
  definition: NonNullable<CombatActionMetadata["scenarioParameters"]>[number]
): readonly number[] {
  if (definition.allowedValues) return definition.allowedValues
  return Array.from(
    { length: definition.maximumValue - definition.minimumValue + 1 },
    (_, index) => definition.minimumValue + index
  )
}

function validateReactionDeclarations(
  characterId: string,
  action: CombatActionMetadata,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const additiveReaction = action.additiveReaction
  const transformativeReaction = action.transformativeReaction
  if ([additiveReaction, action.amplifyingReaction, transformativeReaction].filter(Boolean).length > 1) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "conflicting-reaction-declarations",
      message: `Action ${action.id} cannot declare more than one direct or transformative reaction family`
    })
  }
  if (additiveReaction) {
    const expectedElement = additiveReaction.kind === "spread" ? "dendro" : "electro"
    if (action.element !== expectedElement) {
      issues.push({
        actionId: action.id,
        characterId,
        code: "additive-reaction-element-mismatch",
        message: `${additiveReaction.kind} on action ${action.id} requires ${expectedElement} damage, not ${action.element}`
      })
    }
  }
  if (!transformativeReaction) return

  const isStandaloneTransformativeMetric =
    action.damageKind === "transformative" &&
    action.evaluator === "declared_transformative" &&
    action.kind === "damage" &&
    !action.damageParts &&
    !action.timeline
  if (!isStandaloneTransformativeMetric) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "invalid-transformative-reaction-declaration",
      message: `Transformative action ${action.id} must be a standalone declared_transformative damage metric without direct parts or a timeline`
    })
    return
  }
  const expectedElement = getTransformativeReactionDamageElement(transformativeReaction)
  if (expectedElement === undefined || action.element !== expectedElement) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "transformative-reaction-element-mismatch",
      message: `${transformativeReaction.kind} on action ${action.id} requires ${expectedElement ?? "an explicit swirl damage element"} damage, not ${action.element}`
    })
  }
}

function getTransformativeReactionDamageElement(
  reaction: NonNullable<CombatActionMetadata["transformativeReaction"]>
): CombatActionMetadata["element"] | undefined {
  if (reaction.kind === "bloom" || reaction.kind === "hyperbloom") return "dendro"
  if (reaction.kind === "burning" || reaction.kind === "burgeon" || reaction.kind === "overload") return "pyro"
  if (reaction.kind === "electro_charged") return "electro"
  if (reaction.kind === "superconduct") return "cryo"
  if (reaction.kind === "shatter") return "physical"
  return reaction.damageElement
}

function validateDeclaredDirectDamageParts(
  characterId: string,
  talentParameterOwnerIds: readonly string[],
  action: CombatActionMetadata,
  gameData: GameDataRepository,
  reviewedMultiScalingEvidence: readonly ReviewedMultiScalingEvidenceRecord[],
  scenarioParameters: ReadonlyMap<string, NonNullable<CombatActionMetadata["scenarioParameters"]>[number]>,
  issues: CombatRegistryIntegrityIssue[]
): void {
  if (!isVerifiedDeclaredDirectDamageAction(action)) return

  const damageParts = action.damageParts ?? []
  if (damageParts.length === 0) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "missing-declared-direct-damage-parts",
      message: `Verified declared-direct action ${action.id} must declare at least one damage part`
    })
    return
  }

  validateDeclaredDirectScalingShape(characterId, action, damageParts, issues)

  const damagePartIds = new Set<string>()

  for (const part of damageParts) {
    if (damagePartIds.has(part.id)) {
      issues.push({
        actionId: action.id,
        characterId,
        code: "duplicate-damage-part-id",
        damagePartId: part.id,
        message: `Damage part ${part.id} is declared more than once for action ${action.id}`
      })
    }
    damagePartIds.add(part.id)

    if (hasMultipleScalingTerms(part)) {
      validateReviewedMultiScalingEvidence(
        characterId,
        action,
        part,
        reviewedMultiScalingEvidence,
        issues
      )
      validateReviewedMultiScalingEvidenceSources(
        characterId,
        action,
        part,
        reviewedMultiScalingEvidence,
        issues
      )
      for (const term of part.scalingTerms) {
        if (term.minimumSourceAscension !== undefined && !isValidMetricAscension(term.minimumSourceAscension)) {
          issues.push({
            actionId: action.id,
            characterId,
            code: "invalid-damage-scaling-term",
            damagePartId: part.id,
            message: `Damage term ${term.coefficientParameterId} for action ${action.id} has an invalid source ascension requirement`,
            parameterId: term.coefficientParameterId
          })
        }
        for (const talentParameterOwnerId of talentParameterOwnerIds) {
          validateDamagePartCoefficient(
            characterId,
            talentParameterOwnerId,
            action,
            part.id,
            term.coefficientParameterId,
            term.snapshotChecks,
            gameData,
            issues
          )
          if (term.coefficientMultiplierParameterId !== undefined) {
            validateDamagePartCoefficient(
              characterId,
              talentParameterOwnerId,
              action,
              part.id,
              term.coefficientMultiplierParameterId,
              term.coefficientMultiplierSnapshotChecks,
              gameData,
              issues
            )
          }
        }
        validateDamageTermScenarioMultiplier(
          characterId,
          action,
          part.id,
          term.coefficientMultiplierScenarioParameterId,
          scenarioParameters,
          issues
        )
      }
      continue
    }

    for (const talentParameterOwnerId of talentParameterOwnerIds) {
      validateDamagePartCoefficient(
        characterId,
        talentParameterOwnerId,
        action,
        part.id,
        part.coefficientParameterId,
        part.snapshotChecks,
        gameData,
        issues
      )
    }
  }
}

function validateDamageTermScenarioMultiplier(
  characterId: string,
  action: CombatActionMetadata,
  damagePartId: string,
  parameterId: string | undefined,
  scenarioParameters: ReadonlyMap<string, NonNullable<CombatActionMetadata["scenarioParameters"]>[number]>,
  issues: CombatRegistryIntegrityIssue[]
): void {
  if (parameterId === undefined) return
  const parameter = scenarioParameters.get(parameterId)
  if (!parameter) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "invalid-action-scenario-parameter-reference",
      damagePartId,
      message: `Damage part ${damagePartId} for action ${action.id} references undeclared scenario parameter ${parameterId}`,
      parameterId
    })
    return
  }
  if (parameter.minimumValue >= 0) return
  issues.push({
    actionId: action.id,
    characterId,
    code: "invalid-action-scenario-parameter",
    damagePartId,
    message: `Damage part ${damagePartId} for action ${action.id} requires a non-negative scenario multiplier`,
    parameterId
  })
}

function validateReviewedMultiScalingEvidence(
  characterId: string,
  action: CombatActionMetadata,
  damagePart: Extract<CombatDamagePart, { readonly scalingTerms: unknown }>,
  reviewedMultiScalingEvidence: readonly ReviewedMultiScalingEvidenceRecord[],
  issues: CombatRegistryIntegrityIssue[]
): void {
  const evidence = reviewedMultiScalingEvidence.find(
    (record) => record.actionId === action.id && record.damagePartId === damagePart.id
  )
  if (!evidence) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "missing-reviewed-multi-scaling-evidence",
      damagePartId: damagePart.id,
      message: `Verified multi-scaling damage part ${damagePart.id} for action ${action.id} requires reviewed evidence`
    })
    return
  }
  if (hasMatchingScalingTermPairs(damagePart.scalingTerms, evidence.terms)) return

  issues.push({
    actionId: action.id,
    characterId,
    code: "reviewed-multi-scaling-evidence-term-mismatch",
    damagePartId: damagePart.id,
    message: `Reviewed evidence for multi-scaling damage part ${damagePart.id} of ${action.id} must match its parameter and stat terms exactly`
  })
}

function validateReviewedMultiScalingEvidenceSources(
  characterId: string,
  action: CombatActionMetadata,
  damagePart: Extract<CombatDamagePart, { readonly scalingTerms: unknown }>,
  reviewedMultiScalingEvidence: readonly ReviewedMultiScalingEvidenceRecord[],
  issues: CombatRegistryIntegrityIssue[]
): void {
  const evidence = reviewedMultiScalingEvidence.find(
    (record) => record.actionId === action.id && record.damagePartId === damagePart.id
  )
  if (
    !evidence ||
    !hasMatchingScalingTermPairs(damagePart.scalingTerms, evidence.terms) ||
    hasMatchingReviewedTermSources(action, damagePart.scalingTerms, evidence.terms)
  ) {
    return
  }

  issues.push({
    actionId: action.id,
    characterId,
    code: "reviewed-multi-scaling-evidence-source-mismatch",
    damagePartId: damagePart.id,
    message:
      `Reviewed evidence for multi-scaling damage part ${damagePart.id} of ${action.id} must match its ` +
      "talent parameter paths and snapshot checks"
  })
}

function hasMatchingReviewedTermSources(
  action: CombatActionMetadata,
  declaredTerms: readonly {
    readonly coefficientMultiplierParameterId?: string
    readonly coefficientMultiplierScenarioParameterId?: string
    readonly coefficientMultiplierSnapshotChecks?: readonly { readonly expectedCoefficient: number; readonly talentLevel: number }[]
    readonly coefficientParameterId: string
    readonly minimumSourceAscension?: number
    readonly snapshotChecks?: readonly { readonly expectedCoefficient: number; readonly talentLevel: number }[]
    readonly stat: string
  }[],
  reviewedTerms: readonly ReviewedMultiScalingEvidenceTerm[]
): boolean {
  const remainingTerms = [...reviewedTerms]
  for (const declaredTerm of declaredTerms) {
    const termIndex = remainingTerms.findIndex(
      (reviewedTerm) =>
        reviewedTerm.coefficientMultiplierParameterId === declaredTerm.coefficientMultiplierParameterId &&
        reviewedTerm.coefficientMultiplierScenarioParameterId === declaredTerm.coefficientMultiplierScenarioParameterId &&
        reviewedTerm.coefficientParameterId === declaredTerm.coefficientParameterId &&
        reviewedTerm.minimumSourceAscension === declaredTerm.minimumSourceAscension &&
        reviewedTerm.stat === declaredTerm.stat
    )
    if (termIndex < 0) return false

    const reviewedTerm = remainingTerms.splice(termIndex, 1)[0]
    if (!reviewedTerm || !hasMatchingReviewedTermSource(action, declaredTerm, reviewedTerm)) return false
  }
  return remainingTerms.length === 0
}

function hasMatchingReviewedTermSource(
  action: CombatActionMetadata,
  declaredTerm: {
    readonly coefficientParameterId: string
    readonly coefficientMultiplierParameterId?: string
    readonly coefficientMultiplierScenarioParameterId?: string
    readonly coefficientMultiplierSnapshotChecks?: readonly { readonly expectedCoefficient: number; readonly talentLevel: number }[]
    readonly minimumSourceAscension?: number
    readonly snapshotChecks?: readonly { readonly expectedCoefficient: number; readonly talentLevel: number }[]
  },
  reviewedTerm: ReviewedMultiScalingEvidenceTerm
): boolean {
  const reference = getTalentReference(action, declaredTerm.coefficientParameterId)
  const multiplierParameterId = declaredTerm.coefficientMultiplierParameterId
  if (
    !(
    reference !== undefined &&
    reference.groupId === reviewedTerm.groupId &&
    reference.parameterIndex === reviewedTerm.parameterIndex &&
    reference.talentSlot === reviewedTerm.talentSlot &&
    hasMatchingSnapshotChecks(declaredTerm.snapshotChecks, reviewedTerm.snapshotChecks)
    )
  ) {
    return false
  }
  return (
    multiplierParameterId === reviewedTerm.coefficientMultiplierParameterId &&
    declaredTerm.coefficientMultiplierScenarioParameterId === reviewedTerm.coefficientMultiplierScenarioParameterId &&
    declaredTerm.minimumSourceAscension === reviewedTerm.minimumSourceAscension &&
    hasMatchingSnapshotChecks(
      declaredTerm.coefficientMultiplierSnapshotChecks,
      reviewedTerm.coefficientMultiplierSnapshotChecks ?? []
    )
  )
}

function hasMatchingSnapshotChecks(
  declaredChecks: readonly { readonly expectedCoefficient: number; readonly talentLevel: number }[] | undefined,
  reviewedChecks: readonly { readonly expectedCoefficient: number; readonly talentLevel: number }[]
): boolean {
  const declaredKeys = (declaredChecks ?? []).map(getSnapshotCheckKey).sort()
  const reviewedKeys = reviewedChecks.map(getSnapshotCheckKey).sort()
  return (
    declaredKeys.length === reviewedKeys.length &&
    declaredKeys.every((snapshotCheck, index) => snapshotCheck === reviewedKeys[index])
  )
}

function getSnapshotCheckKey(check: { readonly expectedCoefficient: number; readonly talentLevel: number }): string {
  return JSON.stringify([check.talentLevel, check.expectedCoefficient])
}

function hasMatchingScalingTermPairs(
  declaredTerms: readonly {
    readonly coefficientMultiplierParameterId?: string
    readonly coefficientMultiplierScenarioParameterId?: string
    readonly coefficientParameterId: string
    readonly minimumSourceAscension?: number
    readonly stat: string
  }[],
  reviewedTerms: readonly {
    readonly coefficientMultiplierParameterId?: string
    readonly coefficientMultiplierScenarioParameterId?: string
    readonly coefficientParameterId: string
    readonly minimumSourceAscension?: number
    readonly stat: string
  }[]
): boolean {
  const declaredPairs = declaredTerms.map(getScalingTermPairKey).sort()
  const reviewedPairs = reviewedTerms.map(getScalingTermPairKey).sort()
  return (
    declaredPairs.length === reviewedPairs.length &&
    declaredPairs.every((pair, index) => pair === reviewedPairs[index])
  )
}

function getScalingTermPairKey(term: {
  readonly coefficientMultiplierParameterId?: string
  readonly coefficientMultiplierScenarioParameterId?: string
  readonly coefficientParameterId: string
  readonly minimumSourceAscension?: number
  readonly stat: string
}): string {
  return JSON.stringify([
    term.coefficientParameterId,
    term.coefficientMultiplierParameterId ?? null,
    term.coefficientMultiplierScenarioParameterId ?? null,
    term.minimumSourceAscension ?? null,
    term.stat
  ])
}

function validateActionTimeline(
  characterId: string,
  talentParameterOwnerIds: readonly string[],
  action: CombatActionMetadata,
  scenarioParameters: ReadonlyMap<string, NonNullable<CombatActionMetadata["scenarioParameters"]>[number]>,
  gameData: GameDataRepository,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const timeline = action.timeline
  if (!timeline) return

  if (!isDeclaredDirectDamageAction(action)) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "timeline-unsupported-evaluator",
      message: `Action ${action.id} cannot declare a damage timeline without the declared-direct damage evaluator`
    })
  }
  if (action.additiveReaction || action.amplifyingReaction) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "timeline-action-level-reaction-unsupported",
      message: `Action ${action.id} must declare reaction assumptions per event before using an explicit timeline`
    })
  }

  const damageEvents = Array.isArray(timeline.damageEvents) ? timeline.damageEvents : []
  if (damageEvents.length === 0) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "missing-damage-events",
      message: `Timeline for action ${action.id} must declare at least one damage event`
    })
    return
  }

  const hasValidDuration = Number.isFinite(timeline.duration) && timeline.duration > 0
  if (!hasValidDuration) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "invalid-damage-event-time",
      message: `Timeline duration for action ${action.id} must be a positive finite number`
    })
  }

  const declaredDamagePartIds = new Set((action.damageParts ?? []).map((part) => part.id))
  const mappedDamagePartIds = new Set<string>()
  const damageEventIds = new Set<string>()
  let previousEventTime: number | undefined

  for (const event of damageEvents) {
    if (typeof event.id !== "string" || event.id.trim().length === 0) {
      issues.push({
        actionId: action.id,
        characterId,
        code: "invalid-damage-event-id",
        damageEventId: event.id,
        message: `Damage events for action ${action.id} must have non-empty IDs`
      })
    }
    validateDamageEventSnapshot(characterId, action, event, timeline.duration, issues)
    validateDamageEventScenarioParameters(
      characterId,
      talentParameterOwnerIds,
      action,
      event,
      scenarioParameters,
      gameData,
      issues
    )
    validateElementOverrideTarget(characterId, action, event, gameData, issues)
    validateElementalApplicationIcd(
      characterId,
      action,
      event.id,
      (event as { readonly elementalApplication?: unknown }).elementalApplication,
      issues
    )
    validateElementalApplicationReactionBonus(
      characterId,
      action,
      event.id,
      (event as { readonly elementalApplication?: unknown }).elementalApplication,
      issues
    )
    if (damageEventIds.has(event.id)) {
      issues.push({
        actionId: action.id,
        characterId,
        code: "duplicate-damage-event-id",
        damageEventId: event.id,
        message: `Damage event ${event.id} is declared more than once for action ${action.id}`
      })
    }
    damageEventIds.add(event.id)

    const hasValidEventTime = isValidDamageEventTime(event.at, timeline.duration)
    if (!hasValidEventTime) {
      issues.push({
        actionId: action.id,
        characterId,
        code: "invalid-damage-event-time",
        damageEventId: event.id,
        message: `Damage event ${event.id} for action ${action.id} must occur within its positive finite duration`
      })
    }
    if (hasValidEventTime && previousEventTime !== undefined && event.at < previousEventTime) {
      issues.push({
        actionId: action.id,
        characterId,
        code: "invalid-damage-event-time",
        damageEventId: event.id,
        message: `Damage event ${event.id} for action ${action.id} must not occur before the prior declared event`
      })
    }
    if (hasValidEventTime) previousEventTime = event.at

    if (!declaredDamagePartIds.has(event.damagePartId)) {
      issues.push({
        actionId: action.id,
        characterId,
        code: "missing-damage-event-part",
        damageEventId: event.id,
        damagePartId: event.damagePartId,
        message: `Damage event ${event.id} for action ${action.id} references undeclared part ${event.damagePartId}`
      })
      continue
    }
    mappedDamagePartIds.add(event.damagePartId)
  }

  for (const damagePartId of declaredDamagePartIds) {
    if (mappedDamagePartIds.has(damagePartId)) continue
    issues.push({
      actionId: action.id,
      characterId,
      code: "unmapped-declared-damage-part",
      damagePartId,
      message: `Declared damage part ${damagePartId} for action ${action.id} is not mapped by its timeline`
    })
  }
}

function validateDamageEventScenarioParameters(
  characterId: string,
  talentParameterOwnerIds: readonly string[],
  action: CombatActionMetadata,
  event: CombatDamageEventTemplate,
  scenarioParameters: ReadonlyMap<string, NonNullable<CombatActionMetadata["scenarioParameters"]>[number]>,
  gameData: GameDataRepository,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const hitCount = event.hitCount
  if (typeof hitCount === "number" && (!Number.isInteger(hitCount) || hitCount < 0)) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "invalid-damage-event-scenario-parameter",
      damageEventId: event.id,
      message: `Damage event ${event.id} for action ${action.id} has an invalid static hit count`
    })
  }
  if (typeof hitCount === "object" && !scenarioParameters.has(hitCount.parameterId)) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "invalid-action-scenario-parameter-reference",
      damageEventId: event.id,
      message:
        `Damage event ${event.id} for action ${action.id} references undeclared scenario parameter ` +
        `${hitCount.parameterId}`,
      parameterId: hitCount.parameterId
    })
  }

  const coefficientMultiplier = event.coefficientMultiplier
  if (!coefficientMultiplier) return
  const parameter = scenarioParameters.get(coefficientMultiplier.parameterId)
  if (!parameter) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "invalid-action-scenario-parameter-reference",
      damageEventId: event.id,
      message:
        `Damage event ${event.id} for action ${action.id} references undeclared scenario parameter ` +
        `${coefficientMultiplier.parameterId}`,
      parameterId: coefficientMultiplier.parameterId
    })
    return
  }
  if (coefficientMultiplier.kind === "scenario_parameter_talent_linear") {
    const hasValidBase = Number.isFinite(coefficientMultiplier.base) && coefficientMultiplier.base >= 0
    const hasValidParameterRange = parameter.minimumValue >= 0
    if (!hasValidBase || !hasValidParameterRange) {
      issues.push({
        actionId: action.id,
        characterId,
        code: "invalid-damage-event-scenario-parameter",
        damageEventId: event.id,
        message: `Damage event ${event.id} for action ${action.id} has an invalid talent-linear multiplier definition`
      })
    }
    for (const talentParameterOwnerId of talentParameterOwnerIds) {
      validateDamagePartCoefficient(
        characterId,
        talentParameterOwnerId,
        action,
        event.damagePartId,
        coefficientMultiplier.perParameterTalentCoefficientId,
        coefficientMultiplier.perParameterTalentCoefficientSnapshotChecks,
        gameData,
        issues
      )
    }
    return
  }
  const multipliersByParameterValue = new Map<number, number>()
  for (const entry of coefficientMultiplier.values) {
    if (!Number.isInteger(entry.parameterValue) || !Number.isFinite(entry.multiplier) || entry.multiplier < 0) {
      issues.push({
        actionId: action.id,
        characterId,
        code: "invalid-damage-event-scenario-parameter",
        damageEventId: event.id,
        message: `Damage event ${event.id} for action ${action.id} has an invalid coefficient multiplier lookup`
      })
      continue
    }
    if (multipliersByParameterValue.has(entry.parameterValue)) {
      issues.push({
        actionId: action.id,
        characterId,
        code: "invalid-damage-event-scenario-parameter",
        damageEventId: event.id,
        message: `Damage event ${event.id} for action ${action.id} repeats a coefficient multiplier lookup value`
      })
      continue
    }
    multipliersByParameterValue.set(entry.parameterValue, entry.multiplier)
  }
  for (const parameterValue of getActionScenarioParameterValues(parameter)) {
    if (multipliersByParameterValue.has(parameterValue)) continue
    issues.push({
      actionId: action.id,
      characterId,
      code: "invalid-action-scenario-parameter-reference",
      damageEventId: event.id,
      message:
        `Damage event ${event.id} for action ${action.id} has no coefficient multiplier for ` +
        `${coefficientMultiplier.parameterId}=${parameterValue}`,
      parameterId: coefficientMultiplier.parameterId
    })
  }
}

function validateElementOverrideTarget(
  characterId: string,
  action: CombatActionMetadata,
  event: CombatDamageEventTemplate,
  gameData: GameDataRepository,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const target = (event as { readonly elementOverrideTarget?: unknown }).elementOverrideTarget
  if (target === undefined) return
  if (target !== "normal_attack") {
    issues.push({
      actionId: action.id,
      characterId,
      code: "invalid-element-override-target",
      damageEventId: event.id,
      message: `Damage event ${event.id} for action ${action.id} must target normal_attack for an elemental override`
    })
    return
  }

  const weaponType = gameData.getCharacter(characterId)?.weaponType
  const supportsPhysicalMeleeNormalAttack =
    action.talentSlot === "normal" &&
    action.element === "physical" &&
    weaponType !== "bow" &&
    weaponType !== "catalyst"
  if (supportsPhysicalMeleeNormalAttack) return

  issues.push({
    actionId: action.id,
    characterId,
    code: "invalid-element-override-action",
    damageEventId: event.id,
    message:
      `Damage event ${event.id} for action ${action.id} can receive an elemental override only when it is a ` +
      "Physical melee normal-attack event"
  })
}

function validateDamageEventSnapshot(
  characterId: string,
  action: CombatActionMetadata,
  event: CombatDamageEventTemplate,
  duration: number,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const authoredEvent = event as {
    readonly at: unknown
    readonly id: string
    readonly snapshot?: unknown
    readonly snapshotAt?: unknown
  }
  if (
    authoredEvent.snapshot !== "cast" &&
    authoredEvent.snapshot !== "hit" &&
    authoredEvent.snapshot !== "time"
  ) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "invalid-damage-event-snapshot",
      damageEventId: authoredEvent.id,
      message: `Damage event ${authoredEvent.id} for action ${action.id} must snapshot at cast, hit, or an explicit time`
    })
    return
  }
  if (authoredEvent.snapshot !== "time") return

  if (isValidDamageEventSnapshotTime(authoredEvent.snapshotAt, authoredEvent.at, duration)) return
  issues.push({
    actionId: action.id,
    characterId,
    code: "invalid-damage-event-snapshot-time",
    damageEventId: authoredEvent.id,
    message: `Damage event ${authoredEvent.id} for action ${action.id} must snapshot at a finite time within the action before its hit`
  })
}

function isValidDamageEventSnapshotTime(snapshotAt: unknown, eventTime: unknown, duration: number): boolean {
  return (
    typeof snapshotAt === "number" &&
    Number.isFinite(snapshotAt) &&
    snapshotAt >= 0 &&
    snapshotAt <= duration &&
    typeof eventTime === "number" &&
    Number.isFinite(eventTime) &&
    snapshotAt <= eventTime
  )
}

function validateElementalApplicationIcd(
  characterId: string,
  action: CombatActionMetadata,
  damageEventId: string,
  elementalApplication: unknown,
  issues: CombatRegistryIntegrityIssue[]
): void {
  if (elementalApplication === undefined) return
  if (hasValidElementalApplicationIcd(elementalApplication)) return

  issues.push({
    actionId: action.id,
    characterId,
    code: "invalid-elemental-application-icd",
    damageEventId,
    message: `Damage event ${damageEventId} for action ${action.id} must declare a valid elemental application ICD`
  })
}

function hasValidElementalApplicationIcd(value: unknown): boolean {
  if (!isRecord(value) || !isRecord(value.icd)) return false
  if (value.icd.kind === "none") return true
  return value.icd.kind === "standard" && typeof value.icd.groupId === "string" && value.icd.groupId.trim().length > 0
}

function validateElementalApplicationReactionBonus(
  characterId: string,
  action: CombatActionMetadata,
  damageEventId: string,
  elementalApplication: unknown,
  issues: CombatRegistryIntegrityIssue[]
): void {
  if (!isRecord(elementalApplication) || elementalApplication.reactionBonus === undefined) return
  if (typeof elementalApplication.reactionBonus === "number" && Number.isFinite(elementalApplication.reactionBonus)) {
    return
  }

  issues.push({
    actionId: action.id,
    characterId,
    code: "invalid-elemental-application-reaction-bonus",
    damageEventId,
    message: `Damage event ${damageEventId} for action ${action.id} must declare a finite elemental application reaction bonus`
  })
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null
}

function isValidDamageEventTime(time: number, duration: number): boolean {
  return Number.isFinite(duration) && duration > 0 && Number.isFinite(time) && time >= 0 && time <= duration
}

function validateDeclaredDirectScalingShape(
  characterId: string,
  action: CombatActionMetadata,
  damageParts: readonly CombatDamagePart[],
  issues: CombatRegistryIntegrityIssue[]
): void {
  const hasMultipleScalingPart = damageParts.some(hasMultipleScalingTerms)
  const hasLegacyScalingPart = damageParts.some((part) => !hasMultipleScalingTerms(part))
  const hasTimelineSpecialReaction =
    action.timeline?.damageEvents.some((event) => event.specialReaction !== undefined) ?? false
  const hasInvalidShape =
    (hasMultipleScalingPart &&
      ((hasLegacyScalingPart && (!hasTimelineSpecialReaction || action.scalingStat === undefined)) ||
        (!hasLegacyScalingPart && action.scalingStat !== undefined))) ||
    (!hasMultipleScalingPart && action.scalingStat === undefined)
  if (!hasInvalidShape) return

  issues.push({
    actionId: action.id,
    characterId,
    code: "invalid-declared-direct-scaling-shape",
    message: `Declared-direct action ${action.id} has a scaling shape that its evaluator cannot compile`
  })
}

function validateDamagePartCoefficient(
  characterId: string,
  talentParameterOwnerId: string,
  action: CombatActionMetadata,
  damagePartId: string,
  coefficientParameterId: string,
  snapshotChecks: readonly { readonly expectedCoefficient: number; readonly talentLevel: number }[] | undefined,
  gameData: GameDataRepository,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const reference = getTalentReference(action, coefficientParameterId)
  if (!reference) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "missing-damage-part-coefficient-reference",
      damagePartId,
      message: `Damage part ${damagePartId} for action ${action.id} must reference a declared talent parameter, but ${coefficientParameterId} does not`,
      parameterId: coefficientParameterId
    })
    return
  }

  validateDamagePartSnapshotChecks(
    characterId,
    talentParameterOwnerId,
    action,
    damagePartId,
    snapshotChecks,
    reference,
    gameData,
    issues
  )
}

function getTalentReference(
  action: CombatActionMetadata,
  parameterId: string
): Extract<CombatParameterReference, { readonly source: "talent" }> | undefined {
  return (action.parameterReferences ?? []).find(
    (reference): reference is Extract<CombatParameterReference, { readonly source: "talent" }> =>
      reference.source === "talent" && reference.id === parameterId
  )
}

function validateDamagePartSnapshotChecks(
  characterId: string,
  talentParameterOwnerId: string,
  action: CombatActionMetadata,
  damagePartId: string,
  snapshotChecks: readonly { readonly expectedCoefficient: number; readonly talentLevel: number }[] | undefined,
  reference: Extract<CombatParameterReference, { readonly source: "talent" }>,
  gameData: GameDataRepository,
  issues: CombatRegistryIntegrityIssue[]
): void {
  for (const check of snapshotChecks ?? []) {
    const actualCoefficient = gameData.getCharacterSkillParameter(
      talentParameterOwnerId,
      reference.groupId,
      reference.parameterIndex,
      check.talentLevel
    )
    if (actualCoefficient === check.expectedCoefficient) continue

    issues.push({
      actionId: action.id,
      ...(actualCoefficient === undefined ? {} : { actualCoefficient }),
      characterId,
      code: "talent-coefficient-snapshot-mismatch",
      damagePartId,
      expectedCoefficient: check.expectedCoefficient,
      message: `Talent coefficient ${reference.id} for damage part ${damagePartId} of ${action.id} at level ${check.talentLevel} is expected to be ${check.expectedCoefficient}, but ${talentParameterOwnerId} contains ${actualCoefficient ?? "no value"}`,
      parameterId: reference.id,
      talentLevel: check.talentLevel
    })
  }
}

function hasMultipleScalingTerms(part: CombatDamagePart): part is Extract<CombatDamagePart, { readonly scalingTerms: unknown }> {
  return "scalingTerms" in part
}

function isVerifiedDeclaredDirectDamageAction(action: CombatActionMetadata): boolean {
  return action.status === "verified" && isDeclaredDirectDamageAction(action)
}

function isDeclaredDirectDamageAction(action: CombatActionMetadata): boolean {
  return (
    action.damageKind === "direct" &&
    action.evaluator === "declared_direct" &&
    action.kind === "damage"
  )
}

function validateParameterReference(
  characterId: string,
  talentParameterOwnerIds: readonly string[],
  action: CombatActionMetadata,
  reference: CombatParameterReference,
  gameData: GameDataRepository,
  issues: CombatRegistryIntegrityIssue[]
): void {
  if (reference.source === "talent") {
    validateTalentParameterReference(characterId, talentParameterOwnerIds, action, reference, gameData, issues)
    return
  }

  for (const talentParameterOwnerId of talentParameterOwnerIds) {
    const value = gameData.getCharacterSkillParameterValue(talentParameterOwnerId, reference.groupId, reference.path)
    if (value !== undefined) continue

    issues.push({
      actionId: action.id,
      characterId,
      code: "missing-raw-parameter",
      message: `Raw parameter ${reference.id} for action ${action.id} is missing at ${reference.groupId}[${reference.path.join(
        ","
      )}] for ${talentParameterOwnerId}`,
      parameterId: reference.id
    })
  }
}

function validateTalentParameterReference(
  characterId: string,
  talentParameterOwnerIds: readonly string[],
  action: CombatActionMetadata,
  reference: Extract<CombatParameterReference, { readonly source: "talent" }>,
  gameData: GameDataRepository,
  issues: CombatRegistryIntegrityIssue[]
): void {
  if (!isTalentParameterGroupCompatible(reference.talentSlot, reference.groupId)) {
    issues.push({
      actionId: action.id,
      characterId,
      code: "talent-reference-slot-mismatch",
      message:
        `Talent parameter ${reference.id} for action ${action.id} uses ${reference.groupId}, expected one of ` +
        `${expectedTalentGroups(reference.talentSlot)} for ${reference.talentSlot}`,
      parameterId: reference.id
    })
  }

  for (const talentParameterOwnerId of talentParameterOwnerIds) {
    const value = gameData.getCharacterSkillParameter(
      talentParameterOwnerId,
      reference.groupId,
      reference.parameterIndex,
      1
    )
    if (value !== undefined) continue

    issues.push({
      actionId: action.id,
      characterId,
      code: "missing-talent-parameter",
      message: `Talent parameter ${reference.id} for action ${action.id} is missing at ${reference.groupId}[${reference.parameterIndex}] for ${talentParameterOwnerId}`,
      parameterId: reference.id
    })
  }
}
