import {
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
