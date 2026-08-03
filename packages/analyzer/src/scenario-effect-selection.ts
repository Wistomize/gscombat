import {
  getCombatActionDefinition,
  isCombatActionEffectApplicable,
  listCombatActionEffects,
  type CombatActionEffect,
  type CombatActionMetadata
} from "@gscombat/content"
import { type CharacterBuild, type EvaluationScenario } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

import { resolveDependentActiveEffectIds } from "./action-effects.js"
import { countArtifactSet } from "./artifact-stats.js"
import {
  resolveBuildElement,
  resolvePrimaryDifferentElementTeammateCount,
  resolvePrimarySameElementTeammateCount,
  resolveTeamUniqueElementCount
} from "./build-variant.js"
import type { ResolvedTeamState } from "./team-state.js"

function getEquipmentEffectSourceBuilds(
  effect: CombatActionEffect,
  scenario: EvaluationScenario
): readonly CharacterBuild[] {
  const source = effect.source
  const party = [scenario.primary, ...scenario.teammates]
  const candidates = source.kind === "character" || source.holder === "party_member" ? party : [scenario.primary]
  const matching = candidates.filter((build) => {
    if (source.kind === "weapon") return build.weapon.weaponId === source.weaponId
    if (source.kind === "artifact_set") return countArtifactSet(build, source.setId) >= source.minimumPieces
    return build.characterId === source.characterId
  })
  const relation = effect.targetFilter?.recipientSourceRelation
  if (relation === "source") return matching.filter((build) => build.buildId === scenario.primary.buildId)
  if (relation === "not_source") return matching.filter((build) => build.buildId !== scenario.primary.buildId)
  return matching
}

function isMaximumReachableEffectConditionSatisfied(
  effect: CombatActionEffect,
  scenario: EvaluationScenario,
  gameData: GameDataRepository,
  teamState: ResolvedTeamState
): boolean {
  const condition = effect.condition
  if (!condition) return true
  if (condition.kind === "moonsign_level") {
    const rank = { ascendant_gleam: 2, nascent_gleam: 1, none: 0 } as const
    return rank[teamState.moonsign.level] >= rank[condition.minimum]
  }
  if (condition.kind === "team_unique_element_count") {
    const count = resolveTeamUniqueElementCount([scenario.primary, ...scenario.teammates], gameData)
    return count !== null && count >= condition.minimum
  }
  if (condition.kind === "team_element_count") {
    const elements = [scenario.primary, ...scenario.teammates].flatMap((build) => {
      const element = resolveBuildElement(build, gameData)
      return element === null ? [] : [element]
    })
    return elements.filter((element) => condition.elements.some((candidate) => candidate === element)).length >= condition.minimum
  }
  if (condition.kind === "team_element_subset") {
    const elements = [scenario.primary, ...scenario.teammates].flatMap((build) => {
      const element = resolveBuildElement(build, gameData)
      return element === null || element === "physical" ? [] : [element]
    })
    if (elements.length !== scenario.teammates.length + 1) return false
    if (!elements.every((element) => condition.allowedElements.includes(element))) return false
    return condition.requiredElements?.every((required) => elements.includes(required)) ?? true
  }
  if (condition.kind === "primary_different_element_teammate_count") {
    const count = resolvePrimaryDifferentElementTeammateCount(scenario.primary, scenario.teammates, gameData)
    return count !== null && count >= condition.minimum && (condition.maximum === undefined || count <= condition.maximum)
  }
  if (condition.kind === "primary_same_element_teammate_count") {
    const count = resolvePrimarySameElementTeammateCount(scenario.primary, scenario.teammates, gameData)
    return count !== null && count >= condition.minimum && (condition.maximum === undefined || count <= condition.maximum)
  }
  if (condition.minimum !== undefined && scenario.conditions.enemyCount < condition.minimum) return false
  return condition.maximum === undefined || scenario.conditions.enemyCount <= condition.maximum
}

function getMaximumReachableEffectPriority(effect: CombatActionEffect, declarationIndex: number): number {
  const variant = effect.exclusivity?.variant ?? ""
  const numericValues = [...variant.matchAll(/\d+/g)].map((match) => Number(match[0]))
  const numericPriority = numericValues.length > 0 ? Math.max(...numericValues) * 1000 : 0
  const namedPriority = /full|both|maximum|with-shield|three-stack/.test(variant) ? 100_000 : 0
  return namedPriority + numericPriority + declarationIndex
}

function addMaximumReachableEquipmentEffects(
  selectedEffectIds: Set<string>,
  scenario: EvaluationScenario,
  action: CombatActionMetadata | undefined,
  gameData: GameDataRepository,
  teamState: ResolvedTeamState
): void {
  if (!action) return
  const effects = listCombatActionEffects()
  const selectedExclusivityGroups = new Set(
    effects.flatMap((effect) =>
      selectedEffectIds.has(effect.id) &&
      effect.exclusivity &&
      isCombatActionEffectApplicable(effect, action) &&
      isMaximumReachableEffectConditionSatisfied(effect, scenario, gameData, teamState) &&
      getEquipmentEffectSourceBuilds(effect, scenario).length > 0
        ? [effect.exclusivity.group]
        : []
    )
  )
  const eligibleEffects = effects.flatMap((effect, declarationIndex) => {
    if (
      (effect.activation !== "active" && effect.activation !== "maximum_reachable") ||
      (effect.source.kind === "character" && effect.activation !== "maximum_reachable") ||
      effect.selectionMode === "optional" ||
      effect.target === "additionalDamageEvent" ||
      effect.target === "matchedActionAdditiveDamageTerm" ||
      effect.requiredActiveEffectIds !== undefined ||
      effect.deterministicSnapshotActivation !== undefined ||
      !isCombatActionEffectApplicable(effect, action) ||
      !isMaximumReachableEffectConditionSatisfied(effect, scenario, gameData, teamState) ||
      getEquipmentEffectSourceBuilds(effect, scenario).length === 0
    ) {
      return []
    }
    if (effect.value.kind === "team_burst_energy_cost" && scenario.teammates.length !== 3) return []
    return [{ declarationIndex, effect }]
  })

  const bestByExclusivityGroup = new Map<string, (typeof eligibleEffects)[number]>()
  for (const candidate of eligibleEffects) {
    const group = candidate.effect.exclusivity?.group
    if (!group) {
      selectedEffectIds.add(candidate.effect.id)
      continue
    }
    if (selectedExclusivityGroups.has(group)) continue
    const current = bestByExclusivityGroup.get(group)
    if (
      !current ||
      getMaximumReachableEffectPriority(candidate.effect, candidate.declarationIndex) >
        getMaximumReachableEffectPriority(current.effect, current.declarationIndex)
    ) {
      bestByExclusivityGroup.set(group, candidate)
    }
  }
  for (const candidate of bestByExclusivityGroup.values()) selectedEffectIds.add(candidate.effect.id)
}

function selectAutomaticEffectSources(
  effectIds: readonly string[],
  scenario: EvaluationScenario
): Record<string, string> {
  const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))
  const selectedSources = { ...(scenario.conditions.activeEffectSourceBuildIds ?? {}) }
  for (const effectId of effectIds) {
    const effect = effectsById.get(effectId)
    if (
      !effect ||
      effect.source.kind === "character" ||
      (effect.source.kind === "weapon" && effect.source.resolveAllMatchingPartySources === true)
    ) continue
    const sources = [...getEquipmentEffectSourceBuilds(effect, scenario)]
    if (sources.length < 2 || selectedSources[effectId] !== undefined) continue
    sources.sort((left, right) => right.weapon.refinement - left.weapon.refinement)
    selectedSources[effectId] = sources[0]!.buildId
  }
  return selectedSources
}

/** Normalizes implicit, dependent, and maximum-reachable effect selections for a scenario. */
export function normalizeScenarioEffectSelections(
  scenario: EvaluationScenario,
  gameData: GameDataRepository,
  teamState: ResolvedTeamState
): EvaluationScenario {
  const activeEffectIds = new Set(scenario.conditions.activeEffectIds)
  const action = getCombatActionDefinition(scenario.targetActionId)
  if (scenario.conditions.equipmentEffectMode === "maximum_reachable") {
    addMaximumReachableEquipmentEffects(activeEffectIds, scenario, action, gameData, teamState)
  }
  const automaticEffectSources = selectAutomaticEffectSources([...activeEffectIds], scenario)
  const resolvedActiveEffectIds = resolveDependentActiveEffectIds({
    activeEffectIds: [...activeEffectIds],
    ...(Object.keys(automaticEffectSources).length === 0
      ? {}
      : { activeEffectSourceBuildIds: automaticEffectSources }),
    ...(action === undefined ? {} : { action }),
    primary: scenario.primary,
    teammates: scenario.teammates
  })
  const selectedEffectIds = new Set(resolvedActiveEffectIds)
  const resolvedEffectSources = selectAutomaticEffectSources(resolvedActiveEffectIds, {
    ...scenario,
    conditions: { ...scenario.conditions, activeEffectSourceBuildIds: automaticEffectSources }
  })
  const activeEffectSourceBuildIds = Object.fromEntries(
    Object.entries(resolvedEffectSources).filter(([effectId]) => selectedEffectIds.has(effectId))
  )
  const conditions = { ...scenario.conditions, activeEffectIds: resolvedActiveEffectIds }
  if (Object.keys(activeEffectSourceBuildIds).length > 0) {
    conditions.activeEffectSourceBuildIds = activeEffectSourceBuildIds
  } else {
    delete conditions.activeEffectSourceBuildIds
  }
  return { ...scenario, conditions }
}
