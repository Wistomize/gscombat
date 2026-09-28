import type {
  ActionEffectOptionsRequest,
  ActionEffectOptionsResponse,
  ActiveScenarioEffectOption,
  CharacterBuild
} from "@gscombat/contracts"
import {
  getCombatActionDefinition,
  listCombatActionEffects,
  listActiveScenarioEffectOptionsForAction,
  listCharacterScenarioEffectOptionsForAction,
  supportedCharacters
} from "@gscombat/content"
import { describeWeaponChoices, raidenNationalBuiltinScenario } from "@gscombat/analyzer"
import type { GameDataRepository } from "@gscombat/game-data"

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
export function resolveActionEffectOptions(input: ActionEffectOptionsRequest, gameData?: GameDataRepository): ActionEffectOptionsResponse | null {
  const action = getCombatActionDefinition(input.actionId)
  const character = supportedCharacters.find((candidate) =>
    input.supportMetricId
      ? candidate.supportMetrics?.some((metric) => metric.id === input.supportMetricId && metric.sourceActionId === input.actionId)
      : candidate.primaryActions.some((primaryAction) => primaryAction.id === input.actionId)
  )
  if (!action || !character) return null
  if (input.primary && input.primary.characterId !== character.characterId) return null
  if (input.supportMetricId && (!input.primary || input.primary.constellation <
    (character.supportMetrics?.find((metric) => metric.id === input.supportMetricId)?.minimumSourceConstellation ?? 0))) return null

  const teammates = input.teammates ?? []
  const primary = input.primary
  const onFieldBuildId = input.conditions?.onFieldBuildId
  if (primary && onFieldBuildId !== undefined) {
    if (![primary, ...teammates].some((build) => build.buildId === onFieldBuildId)) {
      throw Object.assign(new Error("前台角色必须是当前队伍成员"), { statusCode: 400 })
    }
    if (!input.supportMetricId && ((action.fieldPresence === "off_field" && onFieldBuildId === primary.buildId) ||
      (action.fieldPresence !== "off_field" && onFieldBuildId !== primary.buildId))) {
      throw Object.assign(new Error("所选前台角色与当前指标的前后台要求冲突"), { statusCode: 400 })
    }
  }
  const options = [
    ...(primary ? listCharacterScenarioEffectOptionsForAction(action) : []),
    ...listActiveScenarioEffectOptionsForAction(action, character.weaponType)
  ]
  const filteredOptions = primary
    ? options.filter((option) => getSourceBuilds(option, primary, teammates).length > 0)
    : options
  const managedIds = new Set(listCombatActionEffects().filter((effect) => effect.source.kind === "weapon" &&
    (effect.weaponChoice || effect.weaponRecipientChoice || effect.lifecycle?.kind === "excluded")).map((effect) => effect.id))
  const weaponChoices = primary ? [primary, ...teammates].map((source) => ({
    sourceBuildId: source.buildId, weaponId: source.weapon.weaponId,
    ...describeWeaponChoices({ ...raidenNationalBuiltinScenario, targetActionId: input.actionId, primary, teammates,
      conditions: input.conditions ?? { activeEffectIds: [], enemyCount: 1 } }, gameData, source.buildId,
      input.supportMetricId ? "support" : "damage")
  })).filter((entry) => entry.choiceGroups.length > 0) : []
  return { options: [...new Map(filteredOptions.filter((option) => !managedIds.has(option.id)).map((option) => [option.id, option])).values()], weaponChoices }
}
