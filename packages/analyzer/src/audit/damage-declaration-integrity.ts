import {
  type CombatActionMetadata, type CombatDamagePart, type ReviewedMultiScalingEvidenceRecord,
  type ReviewedMultiScalingEvidenceTerm
} from "@gscombat/content"
import type { GameDataRepository } from "@gscombat/game-data"

import {
  isValidMetricAscension
} from "./talent-validation.js"
import {
  getTalentReference,
  hasMultipleScalingTerms,
  isVerifiedDeclaredDirectDamageAction, validateDamagePartCoefficient, validateDeclaredDirectScalingShape
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

export function validateReactionDeclarations(
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

export function validateDeclaredDirectDamageParts(
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
