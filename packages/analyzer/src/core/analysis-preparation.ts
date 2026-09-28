import type { Element } from "@gscombat/calculator"
import type { CharacterBuild } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"
import { resolveBaseCombatStats, type ResolvedBaseCombatStats } from "./base-stats.js"

/** Private, synchronous-call-owned cache of pure build inputs, never final scenario stats. */
export class AnalysisPreparation {
  private readonly bases = new WeakMap<CharacterBuild, Map<Element, ResolvedBaseCombatStats>>()

  constructor(private readonly gameData: GameDataRepository) {}

  /** Reuses only this repository and exact immutable build identity within one analysis call. */
  baseStats(build: CharacterBuild, element: Element, gameData: GameDataRepository): ResolvedBaseCombatStats {
    if (gameData !== this.gameData) throw new Error("Analysis preparation belongs to a different game-data repository")
    let elements = this.bases.get(build)
    if (!elements) { elements = new Map(); this.bases.set(build, elements) }
    let base = elements.get(element)
    if (!base) { base = Object.freeze(resolveBaseCombatStats(build, gameData, element)); elements.set(element, base) }
    return base
  }
}
