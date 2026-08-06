import type {
  CharacterCombatCoverage,
  CombatActionMetadata,
  CombatMetricDefinition,
  CombatMetricTalentParameter
} from "@gscombat/content"
import type { GameDataRepository } from "@gscombat/game-data"

import {
  expectedTalentGroups,
  getActionTalentParameterOwnerIds,
  isTalentParameterGroupCompatible,
  isValidMetricAscension,
  isValidMetricConstellation
} from "./talent-validation.js"
import type { CombatRegistryIntegrityIssue } from "./types.js"

export function validateMetricDeclaration(
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
    if (metric.flatParameter) {
      validateMetricTalentParameter(metric, metric.flatParameter, availableTalentParameterOwnerIds, gameData, issues)
    }
    if (metric.flat === undefined && metric.flatParameter === undefined) {
      issues.push({
        ...issueBase,
        code: "invalid-healing-metric-extension",
        message: `Healing metric ${metric.id} must declare a fixed value or talent flat parameter`
      })
    }
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
