import type { Element } from "@gscombat/calculator"
import type { ArtifactStat, CharacterBuild, ExternalBuff } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

import { resolveBuildElement } from "../core/build-variant.js"

export function getBuffTotal(buffs: readonly ExternalBuff[], stat: ExternalBuff["stat"]): number {
  return buffs.reduce((total, buff) => total + (buff.stat === stat ? buff.value : 0), 0)
}

export function resolvePartyElements(
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  gameData: GameDataRepository
): readonly Exclude<Element, "physical">[] {
  return [primary, ...teammates].flatMap((build) => {
    const element = resolveBuildElement(build, gameData)
    return element === null || element === "physical" ? [] : [element]
  })
}

export function getDelta(
  deltas: Partial<Readonly<Record<ArtifactStat, number>>> | undefined,
  stat: ArtifactStat
): number {
  return deltas?.[stat] ?? 0
}
