import {
  elementalResonanceDefinitions,
  hasHexereiSecretRite,
  isMoonsignCharacter,
  resolveMoonsignLevel,
  type ElementalResonanceId,
  type MoonsignLevel
} from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

import { resolveBuildElement } from "./build-variant.js"

export interface ResolvedTeamState {
  readonly activeResonanceIds: readonly ElementalResonanceId[]
  readonly hexereiSecretRite: boolean
  readonly moonsign: {
    readonly characterBuildIds: readonly string[]
    readonly characterCount: number
    readonly level: MoonsignLevel
  }
}

/** Derives composition-only resonance and Moonsign states from the configured party. */
export function resolveTeamState(
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  gameData: GameDataRepository
): ResolvedTeamState {
  const party = [primary, ...teammates]
  const moonsignBuilds = party.filter((build) => isMoonsignCharacter(build.characterId))
  const activeResonanceIds: ElementalResonanceId[] = []
  if (party.length === 4) {
    const elements = party.flatMap((build) => {
      const element = resolveBuildElement(build, gameData)
      return element === null || element === "physical" ? [] : [element]
    })
    const uniqueElementCount = new Set(elements).size
    for (const definition of elementalResonanceDefinitions) {
      if (definition.element && elements.filter((element) => element === definition.element).length >= 2) {
        activeResonanceIds.push(definition.id)
      } else if (definition.requiresUniqueElements === uniqueElementCount) {
        activeResonanceIds.push(definition.id)
      }
    }
  }
  return {
    activeResonanceIds,
    hexereiSecretRite: hasHexereiSecretRite(party.map((build) => build.characterId)),
    moonsign: {
      characterBuildIds: moonsignBuilds.map((build) => build.buildId),
      characterCount: moonsignBuilds.length,
      level: resolveMoonsignLevel(moonsignBuilds.length)
    }
  }
}
