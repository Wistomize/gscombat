import type { ArtifactStat, CharacterBuild } from "@gscombat/contracts"

export type ArtifactStatTotals = Readonly<Record<ArtifactStat, number>>

// Evaluation-only metadata: copied with a build, ignored by JSON/persistence and public schemas.
const artifactSetOverride = Symbol("artifact-set-count-override")
const artifactBaseBuild = Symbol("artifact-base-build")
type EvaluatedBuild = CharacterBuild & {
  readonly [artifactSetOverride]?: Readonly<Record<string, number>>
  readonly [artifactBaseBuild]?: CharacterBuild
}

/** Creates an immutable evaluation view without changing any equipped piece or raw stat. */
export function withArtifactSetCounts(build: CharacterBuild, counts: Readonly<Record<string, number>>): CharacterBuild {
  return { ...build, [artifactSetOverride]: Object.freeze({ ...counts }), [artifactBaseBuild]: build } as EvaluatedBuild
}

/** Returns a reusable raw-stat origin only while all underlying stat inputs remain identical. */
export function getArtifactBaseBuild(build: CharacterBuild): CharacterBuild | undefined {
  const base = (build as EvaluatedBuild)[artifactBaseBuild]
  return base && base !== build && base.characterId === build.characterId && base.level === build.level &&
    base.ascension === build.ascension && base.weapon === build.weapon && base.artifacts === build.artifacts ? base : undefined
}

/** Lists the effective set counts, including temporary comparison overrides. */
export function getArtifactSetCounts(build: CharacterBuild): Readonly<Record<string, number>> {
  const override = (build as EvaluatedBuild)[artifactSetOverride]
  if (override) return override
  const counts = Object.create(null) as Record<string, number>
  for (const artifact of build.artifacts) counts[artifact.setId] = (counts[artifact.setId] ?? 0) + 1
  return counts
}

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
  const override = (build as EvaluatedBuild)[artifactSetOverride]
  if (override) return override[setId] ?? 0
  return build.artifacts.filter(artifact => artifact.setId === setId).length
}
