import type {
  ActionEffectOptionsRequest,
  ActionEffectOptionsResponse,
  ActiveScenarioEffectOption,
  CharacterBuild
} from "@gscombat/contracts"
import {
  getCombatActionDefinition,
  listActiveScenarioEffectOptionsForAction,
  listCharacterScenarioEffectOptionsForAction,
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
    ...(primary ? listCharacterScenarioEffectOptionsForAction(action) : []),
    ...listActiveScenarioEffectOptionsForAction(action, character.weaponType)
  ]
  const filteredOptions = primary
    ? options.filter((option) => getSourceBuilds(option, primary, teammates).length > 0)
    : options
  return { options: [...new Map(filteredOptions.map((option) => [option.id, option])).values()] }
}
