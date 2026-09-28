import type { Element } from "@gscombat/calculator"
import type { CharacterBuild } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"
import { resolveBaseCombatStats, type ResolvedBaseCombatStats } from "./base-stats.js"
import { getTwoPieceHealingBonus, HEALING_BONUS_TWO_PIECE_SET_IDS } from "@gscombat/content"
import { countArtifactSet, getArtifactBaseBuild } from "./artifact-stats.js"

/** Private analysis/session-owned cache of immutable build inputs, never final scenario stats. */
export class AnalysisPreparation {
  private readonly bases = new WeakMap<CharacterBuild, Map<Element, ResolvedBaseCombatStats>>()

  constructor(private readonly gameData: GameDataRepository) {}

  /** Reuses only this repository and exact immutable build identity within the owning analysis/session. */
  baseStats(build: CharacterBuild, element: Element, gameData: GameDataRepository): ResolvedBaseCombatStats {
    if (gameData !== this.gameData) throw new Error("Analysis preparation belongs to a different game-data repository")
    let elements = this.bases.get(build)
    if (!elements) { elements = new Map(); this.bases.set(build, elements) }
    let base = elements.get(element)
    if (!base) {
      const origin = getArtifactBaseBuild(build)
      if (origin) {
        const raw = this.baseStats(origin, element, gameData)
        const artifactSetHealingBonus = HEALING_BONUS_TWO_PIECE_SET_IDS.reduce(
          (sum, id) => sum + getTwoPieceHealingBonus(id, countArtifactSet(build, id)), 0)
        base = Object.freeze({ ...raw, artifactSetHealingBonus,
          healingBonus: raw.healingBonus - raw.artifactSetHealingBonus + artifactSetHealingBonus })
      } else base = Object.freeze(resolveBaseCombatStats(build, gameData, element))
      elements.set(element, base)
    }
    return base
  }
}
