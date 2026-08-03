import type { ArtifactStat, CharacterBuild } from "@gscombat/contracts"

export type ArtifactStatTotals = Readonly<Record<ArtifactStat, number>>

const supportedStats: readonly ArtifactStat[] = [
  "hp",
  "hp_percent",
  "atk",
  "atk_percent",
  "def",
  "def_percent",
  "elemental_mastery",
  "energy_recharge",
  "crit_rate",
  "crit_damage",
  "healing_bonus",
  "physical_damage_bonus",
  "anemo_damage_bonus",
  "cryo_damage_bonus",
  "dendro_damage_bonus",
  "electro_damage_bonus",
  "geo_damage_bonus",
  "hydro_damage_bonus",
  "pyro_damage_bonus"
]

/** Aggregates all main and substat values without applying character mechanics. */
export function aggregateArtifactStats(build: CharacterBuild): ArtifactStatTotals {
  const totals = Object.fromEntries(supportedStats.map((stat) => [stat, 0])) as Record<ArtifactStat, number>
  for (const artifact of build.artifacts) {
    totals[artifact.mainStat.stat] += artifact.mainStat.value
    for (const substat of artifact.substats) totals[substat.stat] += substat.value
  }
  return totals
}

/** Counts equipped pieces by artifact set ID. */
export function countArtifactSet(build: CharacterBuild, setId: string): number {
  return build.artifacts.filter((artifact) => artifact.setId === setId).length
}
