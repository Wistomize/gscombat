import {
  characterCombatCoverageRegistry,
  reviewedMultiScalingEvidenceRegistry,
  type CharacterCombatCoverage,
  type CombatActionMetadata, type ReviewedMultiScalingEvidenceRecord
} from "@gscombat/content"
import type { GameDataRepository } from "@gscombat/game-data"

import {
  validateActionCappedStatToAttackConversion,
  validateActionIntrinsicEffects,
  validateActionScenarioParameters
} from "./action-intrinsic-integrity.js"
import { validateDeclaredDirectDamageParts, validateReactionDeclarations } from "./damage-declaration-integrity.js"
import { validateElementOverrideEffect } from "./effect-integrity.js"
import { validateMetricDeclaration } from "./metric-integrity.js"
import {
  getActionTalentParameterOwnerIds
} from "./talent-validation.js"
import {
  validateActionTimeline, validateParameterReference
} from "./timeline-integrity.js"

import type {
  CombatRegistryIntegrityIssue, CombatRegistryIntegrityReport,
  ValidateCombatRegistryIntegrityInput
} from "./types.js"

export type {
  CombatRegistryIntegrityIssue,
  CombatRegistryIntegrityIssueCode,
  CombatRegistryIntegrityReport,
  ValidateCombatRegistryIntegrityInput
} from "./types.js"

const levelledTalentSlots = new Set(["normal", "skill", "burst"])
const travelerElements = new Set(["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"])

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
