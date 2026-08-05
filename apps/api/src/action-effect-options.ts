import type {
  ActionEffectOptionsRequest,
  ActionEffectOptionsResponse,
  ActiveScenarioEffectOption,
  CharacterBuild
} from "@gscombat/contracts"
import {
  getCombatActionDefinition,
  listActiveScenarioEffectOptionsForAction,
  supportedCharacters
} from "@gscombat/content"

function countArtifactSetPieces(build: CharacterBuild, setId: string): number {
  return build.artifacts.filter((artifact) => artifact.setId === setId).length
}

function getSourceBuilds(
  option: ActiveScenarioEffectOption,
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[]
): readonly CharacterBuild[] {
  const party = [primary, ...teammates]
  const source = option.source
  let sourceBuilds: readonly CharacterBuild[]
  if (source.kind === "character") {
    sourceBuilds = party.filter(
      (build) => build.characterId === source.characterId &&
        build.constellation >= (source.minimumSourceConstellation ?? 0)
    )
  } else if (source.kind === "weapon") {
    const holders = source.holder === "party_member" ? party : [primary]
    sourceBuilds = holders.filter((build) => build.weapon.weaponId === source.weaponId)
  } else {
    const holders = source.holder === "party_member" ? party : [primary]
    sourceBuilds = holders.filter((build) => countArtifactSetPieces(build, source.setId) >= source.minimumPieces)
  }
  if (option.recipientSourceRelation === "not_source") {
    return sourceBuilds.filter((build) => build.buildId !== primary.buildId)
  }
  if (option.recipientSourceRelation === "source") {
    return sourceBuilds.filter((build) => build.buildId === primary.buildId)
  }
  return sourceBuilds
}

function listTemporaryOptions(
  actionId: string,
  primary: CharacterBuild | undefined,
  teammates: readonly CharacterBuild[]
): readonly ActiveScenarioEffectOption[] {
  if (!primary) return []
  return [
    ...(actionId === "raiden.burst.initial_slash"
      ? [{ id: "raiden.skill.eye", label: "雷罚恶曜之眼", source: { characterId: "RaidenShogun", kind: "character" as const } }]
      : []),
    ...(teammates.some((build) => build.characterId === "Bennett")
      ? [{ id: "bennett.burst.field", label: "班尼特领域", source: { characterId: "Bennett", kind: "character" as const } }]
      : [])
  ]
}

/** Resolves active action snapshots and narrows them to sources equipped by the supplied party. */
export function resolveActionEffectOptions(input: ActionEffectOptionsRequest): ActionEffectOptionsResponse | null {
  const action = getCombatActionDefinition(input.actionId)
  const character = supportedCharacters.find((candidate) =>
    candidate.primaryActions.some((primaryAction) => primaryAction.id === input.actionId)
  )
  if (!action || !character) return null
  if (input.primary && input.primary.characterId !== character.characterId) return null

  const teammates = input.teammates ?? []
  const primary = input.primary
  const options = [
    ...listTemporaryOptions(input.actionId, primary, teammates),
    ...listActiveScenarioEffectOptionsForAction(action, character.weaponType)
  ]
  const filteredOptions = primary
    ? options.filter((option) => getSourceBuilds(option, primary, teammates).length > 0)
    : options
  return { options: [...new Map(filteredOptions.map((option) => [option.id, option])).values()] }
}
