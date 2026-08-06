import {
  type CombatActionMetadata,
  type CombatDamageEventTemplate,
  type CombatDamagePart, type CombatParameterReference
} from "@gscombat/content"
import type { GameDataRepository } from "@gscombat/game-data"

import {
  expectedTalentGroups, isTalentParameterGroupCompatible
} from "./talent-validation.js"

import type {
  CombatRegistryIntegrityIssue
} from "./types.js"

export type {
  CombatRegistryIntegrityIssue,
  CombatRegistryIntegrityIssueCode,
  CombatRegistryIntegrityReport,
  ValidateCombatRegistryIntegrityInput
} from "./types.js"

import { getActionScenarioParameterValues } from "./scenario-parameter-values.js"

export function validateActionTimeline(
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

export function validateDeclaredDirectScalingShape(
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

export function validateDamagePartCoefficient(
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

export function getTalentReference(
  action: CombatActionMetadata,
  parameterId: string
): Extract<CombatParameterReference, { readonly source: "talent" }> | undefined {
  return (action.parameterReferences ?? []).find(
    (reference): reference is Extract<CombatParameterReference, { readonly source: "talent" }> =>
      reference.source === "talent" && reference.id === parameterId
  )
}

export function validateDamagePartSnapshotChecks(
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

export function hasMultipleScalingTerms(
  part: CombatDamagePart
): part is Extract<CombatDamagePart, { readonly scalingTerms: unknown }> {
  return "scalingTerms" in part
}

export function isVerifiedDeclaredDirectDamageAction(action: CombatActionMetadata): boolean {
  return action.status === "verified" && isDeclaredDirectDamageAction(action)
}

function isDeclaredDirectDamageAction(action: CombatActionMetadata): boolean {
  return (
    action.damageKind === "direct" &&
    action.evaluator === "declared_direct" &&
    action.kind === "damage"
  )
}

export function validateParameterReference(
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
