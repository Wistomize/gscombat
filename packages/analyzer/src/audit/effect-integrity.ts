import {
  type CombatActionEffect,
  type CombatActionMetadata,
  type CombatElementOverrideEffect
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

const elementalOverrideElements = new Set(["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"])
const meleeWeaponTypes = new Set(["claymore", "polearm", "sword"])
const transformativeReactionKinds = new Set([
  "bloom",
  "burning",
  "burgeon",
  "electro_charged",
  "hyperbloom",
  "overload",
  "shatter",
  "superconduct",
  "swirl"
])

export function validateActionEffect(
  coverageCharacterId: string,
  effect: CombatActionEffect,
  effectIds: Set<string>,
  actionsById: ReadonlyMap<string, CombatActionMetadata>,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const issueBase = { characterId: coverageCharacterId, effectId: effect.id }
  if (effectIds.has(effect.id)) {
    issues.push({
      ...issueBase,
      code: "duplicate-action-effect-id",
      message: `Action effect ID ${effect.id} is declared more than once in the combat registry`
    })
  }
  effectIds.add(effect.id)

  validateActionEffectSource(effect, coverageCharacterId, issues)
  validateActionEffectEventFilter(effect, coverageCharacterId, actionsById, issues)
  validateAdditionalDamageEventIdentity(effect, coverageCharacterId, issues)
  validateMatchedActionScenarioParameterShape(effect, coverageCharacterId, issues)

  if (effect.target !== "transformativeReactionCritRate" && effect.target !== "transformativeReactionCritDamage") {
    return
  }

  const reactionKinds = effect.targetFilter?.reactionKinds
  const hasOnlyTransformativeReactions =
    reactionKinds !== undefined &&
    reactionKinds.length > 0 &&
    reactionKinds.every((reactionKind) => transformativeReactionKinds.has(reactionKind))
  const hasMatchingCharacterSource =
    effect.source.kind === "character" && effect.source.characterId === coverageCharacterId
  const hasValidConstellation =
    effect.source.kind === "character" &&
    effect.source.minimumSourceConstellation !== undefined &&
    Number.isInteger(effect.source.minimumSourceConstellation) &&
    effect.source.minimumSourceConstellation >= 1 &&
    effect.source.minimumSourceConstellation <= 6
  const hasNonNegativeValue = hasNonNegativeCritEffectValue(effect)
  if (hasOnlyTransformativeReactions && hasMatchingCharacterSource && hasValidConstellation && hasNonNegativeValue) {
    return
  }

  issues.push({
    ...issueBase,
    code: "invalid-transformative-reaction-crit-effect",
    message:
      `Transformative-reaction CRIT effect ${effect.id} must use a matching constellation-gated character source, ` +
      "one or more ordinary transformative reaction kinds, and a non-negative fixed or refinement value"
  })
}

function validateActionEffectEventFilter(
  effect: CombatActionEffect,
  coverageCharacterId: string,
  actionsById: ReadonlyMap<string, CombatActionMetadata>,
  issues: CombatRegistryIntegrityIssue[]
): void {
  const eventIds = effect.targetFilter?.eventIds
  if (eventIds === undefined) return
  const actionIds = effect.targetFilter?.actionIds
  const actions = actionIds?.flatMap((actionId) => {
    const action = actionsById.get(actionId)
    return action ? [action] : []
  }) ?? []
  const declaredEventIds = new Set(actions.flatMap((action) => action.timeline?.damageEvents.map((event) => event.id) ?? []))
  const hasValidFilter =
    eventIds.length > 0 &&
    actionIds !== undefined &&
    actionIds.length > 0 &&
    actions.length === actionIds.length &&
    eventIds.every((eventId) => declaredEventIds.has(eventId))
  if (hasValidFilter) return
  issues.push({
    characterId: coverageCharacterId,
    code: "invalid-action-effect-event-filter",
    effectId: effect.id,
    message:
      `Event-scoped action effect ${effect.id} must target existing action IDs and non-empty event IDs declared ` +
      "by those action timelines"
  })
}

function validateActionEffectSource(
  effect: CombatActionEffect,
  coverageCharacterId: string,
  issues: CombatRegistryIntegrityIssue[]
): void {
  if (effect.source.kind !== "character") return
  const minimum = effect.source.minimumSourceConstellation
  if (
    effect.source.characterId === coverageCharacterId &&
    (minimum === undefined || (Number.isInteger(minimum) && minimum >= 1 && minimum <= 6))
  ) {
    return
  }
  issues.push({
    characterId: coverageCharacterId,
    code: "invalid-action-effect-source",
    effectId: effect.id,
    message:
      `Character action effect ${effect.id} must use its coverage owner and a source constellation from one through six`
  })
}

function validateAdditionalDamageEventIdentity(
  effect: CombatActionEffect,
  coverageCharacterId: string,
  issues: CombatRegistryIntegrityIssue[]
): void {
  if (effect.target !== "additionalDamageEvent") return
  const attackKind = effect.value.attackKind
  const talentSlot = effect.value.talentSlot
  const hasValidAttackKind = attackKind === undefined || ["charged", "normal", "plunge"].includes(attackKind)
  const hasValidTalentSlot =
    talentSlot === undefined || ["normal", "plunge", "skill", "burst", "passive", "constellation"].includes(talentSlot)
  const identityBelongsToCharacter =
    (attackKind === undefined && talentSlot === undefined) || effect.source.kind === "character"
  if (hasValidAttackKind && hasValidTalentSlot && identityBelongsToCharacter) return
  issues.push({
    characterId: coverageCharacterId,
    code: "invalid-additional-damage-event-identity",
    effectId: effect.id,
    message: `Additional damage event ${effect.id} must use a valid character-owned attack kind or talent slot identity`
  })
}

function validateMatchedActionScenarioParameterShape(
  effect: CombatActionEffect,
  coverageCharacterId: string,
  issues: CombatRegistryIntegrityIssue[]
): void {
  if (effect.target !== "matchedActionAdditiveDamageTerm") return
  const parameterId = effect.value.coefficientMultiplierScenarioParameterId
  const scale = effect.value.coefficientMultiplierScenarioParameterScale
  const hasValidId = parameterId === undefined || parameterId.trim().length > 0
  const hasValidScale = scale === undefined || (parameterId !== undefined && Number.isFinite(scale) && scale >= 0)
  if (hasValidId && hasValidScale) return
  issues.push({
    characterId: coverageCharacterId,
    code: "invalid-matched-action-scenario-parameter",
    effectId: effect.id,
    message: `Same-hit term ${effect.id} must use a non-empty action snapshot ID and a finite non-negative scale`
  })
}

function hasNonNegativeCritEffectValue(effect: CombatActionEffect): boolean {
  if (effect.value.kind === "fixed") return Number.isFinite(effect.value.value) && effect.value.value >= 0
  if (effect.value.kind === "refinement_table") {
    return effect.value.values.every((value) => Number.isFinite(value) && value >= 0)
  }
  return false
}

export function validateElementOverrideEffect(
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
