import {
  getCharacterCombatDefinition,
  type CombatActionMetadata,
  type CombatCoverageStatus,
  type CombatElementOverrideEffect,
  type CombatMetricDefinition
} from "@gscombat/content"
import type { GameDataRepository } from "@gscombat/game-data"

/** Combines immutable game-data facts with the maintained battle-logic coverage declaration. */
export interface CharacterCombatReadiness {
  readonly actions: readonly CombatActionMetadata[]
  /** Whether this character has at least one verified damage action that the analyzer can evaluate. */
  readonly canCalculateDamage: boolean
  readonly characterId: string
  readonly detail: string
  readonly element: string | null
  /** Source-owned effects that a scenario can activate when their source build is present. */
  readonly effects: readonly CombatElementOverrideEffect[]
  readonly hasCoreTalentParameters: boolean
  /** The status of developer-maintained combat logic, distinct from upstream snapshot availability. */
  readonly maintainedStatus: CombatCoverageStatus
  /** Maintainer-selected, character-owned outputs that can be chosen independently from raw actions. */
  readonly metrics: readonly CombatMetricDefinition[]
  readonly parameterGroups: readonly string[]
  readonly rarity: number
  /** Whether upstream static character data exists in this local snapshot. */
  readonly staticDataAvailable: boolean
  /** @deprecated Use maintainedStatus to distinguish logic coverage from static data availability. */
  readonly status: CombatCoverageStatus
  /** Number of individually verified actions, including verified support actions. */
  readonly verifiedActionCount: number
  /** Number of maintainer-selected metrics that the analyzer can evaluate. */
  readonly verifiedMetricCount: number
  readonly weaponType: string
}

/** A transparent inventory of data availability versus executable combat coverage. */
export interface CombatCoverageReport {
  readonly characters: readonly CharacterCombatReadiness[]
  readonly characterStatusCounts: Readonly<Record<CombatCoverageStatus, number>>
  readonly totalCharacters: number
  readonly verifiedActionCount: number
  readonly verifiedMetricCount: number
}

/** Creates a coverage report without treating raw talent values as verified battle behavior. */
export function createCombatCoverageReport(gameData: GameDataRepository): CombatCoverageReport {
  const characterStatusCounts: Record<CombatCoverageStatus, number> = {
    draft: 0,
    unsupported: 0,
    verified: 0
  }
  let totalVerifiedActionCount = 0
  let totalVerifiedMetricCount = 0
  const characters = gameData.listCharacters().map((character) => {
    const coverage = getCharacterCombatDefinition(character.id)
    const parameterGroups = gameData.listCharacterSkillParameterGroupIds(character.id)
    const status = coverage?.status ?? "unsupported"
    const actions = coverage?.actions ?? []
    const effects = coverage?.effects ?? []
    const metrics = coverage?.metrics ?? []
    const characterVerifiedActionCount = actions.filter((action) => action.status === "verified").length
    const characterVerifiedMetricCount = metrics.filter((metric) => metric.status === "verified").length
    characterStatusCounts[status] += 1
    totalVerifiedActionCount += characterVerifiedActionCount
    totalVerifiedMetricCount += characterVerifiedMetricCount
    return {
      actions,
      canCalculateDamage: actions.some((action) => action.kind === "damage" && action.status === "verified"),
      characterId: character.id,
      detail: coverage?.detail ?? "Static game data is available, but no battle-logic definition is maintained yet.",
      element: character.element,
      effects,
      hasCoreTalentParameters: ["auto", "skill", "burst"].every((groupId) => parameterGroups.includes(groupId)),
      maintainedStatus: status,
      metrics,
      parameterGroups,
      rarity: character.rarity,
      staticDataAvailable: true,
      status,
      verifiedActionCount: characterVerifiedActionCount,
      verifiedMetricCount: characterVerifiedMetricCount,
      weaponType: character.weaponType
    }
  })
  return {
    characters,
    characterStatusCounts,
    totalCharacters: characters.length,
    verifiedActionCount: totalVerifiedActionCount,
    verifiedMetricCount: totalVerifiedMetricCount
  }
}
