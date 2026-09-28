import type { ArtifactSlot, ArtifactStat, CharacterBuild } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"
import type { AnalysisPreparation } from "../core/analysis-preparation.js"

const slots: readonly ArtifactSlot[] = ["flower", "plume", "sands", "goblet", "circlet"]
const dataStats: Readonly<Record<ArtifactStat, string>> = {
  hp: "hp", hp_percent: "hp_", atk: "atk", atk_percent: "atk_", def: "def", def_percent: "def_",
  elemental_mastery: "eleMas", energy_recharge: "enerRech_", crit_rate: "critRate_", crit_damage: "critDMG_",
  healing_bonus: "heal_", physical_damage_bonus: "physical_dmg_", anemo_damage_bonus: "anemo_dmg_",
  cryo_damage_bonus: "cryo_dmg_", dendro_damage_bonus: "dendro_dmg_", electro_damage_bonus: "electro_dmg_",
  geo_damage_bonus: "geo_dmg_", hydro_damage_bonus: "hydro_dmg_", pyro_damage_bonus: "pyro_dmg_"
}

interface MainStatVariant {
  readonly build: CharacterBuild
  readonly fourStarSlots: readonly ArtifactSlot[]
}

// Lifetime is bounded by the comparison preparation, not by a process-wide user-build registry.
const caches = new WeakMap<AnalysisPreparation, WeakMap<CharacterBuild, Map<number, readonly MainStatVariant[]>>>()

/** Enumerates only necessary four-star positions and reuses unchanged raw-stat build identities across sets. */
export function artifactMainStatVariants(build: CharacterBuild, counts: Readonly<Record<string, number>>,
  gameData: GameDataRepository, preparation: AnalysisPreparation): readonly MainStatVariant[] {
  const count = Object.entries(counts).reduce((sum, [id, pieces]) =>
    sum + (gameData.getArtifactSet(id)?.rarities.includes(5) ? 0 : pieces), 0)
  if (count === 0) return [{ build, fourStarSlots: [] }]
  if (count !== 2 && count !== 4) throw new Error(`不支持的四星套装件数：${count}`)
  let builds = caches.get(preparation)
  if (!builds) { builds = new WeakMap(); caches.set(preparation, builds) }
  let variants = builds.get(build)
  if (!variants) { variants = new Map(); builds.set(build, variants) }
  const cached = variants.get(count)
  if (cached) return cached

  const assignments: ArtifactSlot[][] = []
  const choose = (start: number, chosen: ArtifactSlot[]): void => {
    if (chosen.length === count) { assignments.push(chosen); return }
    for (let index = start; index <= slots.length - (count - chosen.length); index++) {
      choose(index + 1, [...chosen, slots[index]!])
    }
  }
  choose(0, [])
  const seen = new Set<string>()
  const result: MainStatVariant[] = []
  for (const fourStarSlots of assignments) {
    const artifacts = build.artifacts.map(piece => {
      if (!fourStarSlots.includes(piece.slot)) return piece
      const value = gameData.getArtifactMainStat(4, dataStats[piece.mainStat.stat], 16)
      if (value === undefined || !Number.isFinite(value)) throw new Error(`缺少四星16级主词条：${piece.mainStat.stat}`)
      return { ...piece, mainStat: { ...piece.mainStat, value } }
    })
    // Missing slots never add stats; assignments with identical actual inputs need only one evaluation.
    const key = JSON.stringify(artifacts.map(piece => piece.mainStat))
    if (seen.has(key)) continue
    seen.add(key)
    result.push({ build: { ...build, artifacts }, fourStarSlots })
  }
  variants.set(count, result)
  return result
}
