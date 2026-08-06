import {
  type CombatActionMetadata
} from "@gscombat/content"
import type { GameDataRepository } from "@gscombat/game-data"

import { getActionScenarioParameterValues } from "./scenario-parameter-values.js"
import {
  isValidMetricAscension
} from "./talent-validation.js"
import {
  getTalentReference, isVerifiedDeclaredDirectDamageAction, validateDamagePartSnapshotChecks
} from "./timeline-integrity.js"

import type {
  CombatRegistryIntegrityIssue
} from "./types.js"

export type {
  CombatRegistryIntegrityIssue,
  CombatRegistryIntegrityIssueCode,
  CombatRegistryIntegrityReport,
  ValidateCombatRegistryIntegrityInput
} from "./types.js"

export function validateActionScenarioParameters(
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

export function validateActionIntrinsicEffects(
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

export function validateActionCappedStatToAttackConversion(
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
