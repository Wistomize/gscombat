import { getCharacterCombatDefinition } from "@gscombat/content"
import type { CharacterSkillParameterGroupSummary, GameDataRepository } from "@gscombat/game-data"

const coreTalentGroupIds = ["auto", "skill", "burst"] as const

export type CombatAuthoringReadiness =
  | "ready_for_semantic_authoring"
  | "requires_explicit_variant_binding"
  | "missing_talent_parameters"

export interface CombatAuthoringCoreTalentGroups {
  readonly auto: CharacterSkillParameterGroupSummary | null
  readonly burst: CharacterSkillParameterGroupSummary | null
  readonly skill: CharacterSkillParameterGroupSummary | null
}

export interface CombatAuthoringTalentParameterOwner {
  readonly coreTalentGroups: CombatAuthoringCoreTalentGroups
  readonly talentParameterOwnerId: string
}

export interface CharacterCombatAuthoringWorkItem {
  readonly candidateTalentParameterOwners: readonly CombatAuthoringTalentParameterOwner[]
  readonly declaredActionIds: readonly string[]
  readonly element: string | null
  readonly inherentBaseStats: Readonly<Record<string, number>>
  readonly readiness: CombatAuthoringReadiness
  readonly selectedTalentParameterOwnerId: string | null
  readonly staticCharacterId: string
  readonly weaponType: string
}

export interface CombatAuthoringAuditReport {
  readonly characters: readonly CharacterCombatAuthoringWorkItem[]
  readonly readinessCounts: Readonly<Record<CombatAuthoringReadiness, number>>
  readonly totalStaticCharacters: number
  /** Raw parameter owners that do not have an exact static-character row and must not be auto-bound. */
  readonly unboundTalentParameterOwnerIds: readonly string[]
}

function getCoreTalentGroups(
  gameData: GameDataRepository,
  talentParameterOwnerId: string
): CombatAuthoringCoreTalentGroups {
  return {
    auto: gameData.getCharacterSkillParameterGroupSummary(talentParameterOwnerId, "auto") ?? null,
    burst: gameData.getCharacterSkillParameterGroupSummary(talentParameterOwnerId, "burst") ?? null,
    skill: gameData.getCharacterSkillParameterGroupSummary(talentParameterOwnerId, "skill") ?? null
  }
}

function hasCoreTalentGroups(groups: CombatAuthoringCoreTalentGroups): boolean {
  return coreTalentGroupIds.every((groupId) => {
    const summary = groups[groupId]
    return (
      summary !== null &&
      summary.parameterCount > 0 &&
      summary.minimumTalentLevel === 1 &&
      summary.maximumTalentLevel === 15
    )
  })
}

function getCandidateTalentParameterOwnerIds(
  staticCharacterId: string,
  parameterOwnerIds: readonly string[]
): readonly string[] {
  return parameterOwnerIds.filter((ownerId) => ownerId.startsWith(staticCharacterId))
}

function getReadiness(
  selectedOwner: CombatAuthoringTalentParameterOwner | undefined,
  candidateOwners: readonly CombatAuthoringTalentParameterOwner[]
): CombatAuthoringReadiness {
  if (selectedOwner) return hasCoreTalentGroups(selectedOwner.coreTalentGroups) ? "ready_for_semantic_authoring" : "missing_talent_parameters"
  return candidateOwners.length > 0 ? "requires_explicit_variant_binding" : "missing_talent_parameters"
}

/**
 * Lists snapshot-backed authoring work without inferring hit names, damage elements, scaling, or timing from arrays.
 */
export function createCombatAuthoringAuditReport(gameData: GameDataRepository): CombatAuthoringAuditReport {
  const parameterOwnerIds = gameData.listCharacterSkillParameterOwnerIds()
  const staticCharacters = gameData.listCharacters()
  const staticCharacterIds = new Set(staticCharacters.map((character) => character.id))
  const readinessCounts: Record<CombatAuthoringReadiness, number> = {
    missing_talent_parameters: 0,
    ready_for_semantic_authoring: 0,
    requires_explicit_variant_binding: 0
  }
  const characters = staticCharacters.map((character) => {
    const candidateTalentParameterOwners = getCandidateTalentParameterOwnerIds(character.id, parameterOwnerIds).map(
      (talentParameterOwnerId) => ({
        coreTalentGroups: getCoreTalentGroups(gameData, talentParameterOwnerId),
        talentParameterOwnerId
      })
    )
    const selectedTalentParameterOwner =
      candidateTalentParameterOwners.length === 1 && candidateTalentParameterOwners[0]?.talentParameterOwnerId === character.id
        ? candidateTalentParameterOwners[0]
        : undefined
    const readiness = getReadiness(selectedTalentParameterOwner, candidateTalentParameterOwners)
    const coverage = getCharacterCombatDefinition(character.id)
    readinessCounts[readiness] += 1

    return {
      candidateTalentParameterOwners,
      declaredActionIds: coverage?.actions.map((action) => action.id) ?? [],
      element: character.element,
      inherentBaseStats: gameData.getCharacterBaseStats(character.id),
      readiness,
      selectedTalentParameterOwnerId: selectedTalentParameterOwner?.talentParameterOwnerId ?? null,
      staticCharacterId: character.id,
      weaponType: character.weaponType
    }
  })

  return {
    characters,
    readinessCounts,
    totalStaticCharacters: characters.length,
    unboundTalentParameterOwnerIds: parameterOwnerIds.filter((ownerId) => !staticCharacterIds.has(ownerId))
  }
}
