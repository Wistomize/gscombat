import type { ArtifactStat } from "@gscombat/contracts"

const percentageStats = new Set<ArtifactStat>([
  "anemo_damage_bonus",
  "atk_percent",
  "crit_damage",
  "crit_rate",
  "cryo_damage_bonus",
  "def_percent",
  "dendro_damage_bonus",
  "electro_damage_bonus",
  "energy_recharge",
  "geo_damage_bonus",
  "healing_bonus",
  "hp_percent",
  "hydro_damage_bonus",
  "physical_damage_bonus",
  "pyro_damage_bonus"
])

/** Converts an internal artifact stat ratio to a form-friendly value. */
export function toDisplayStatValue(stat: ArtifactStat, value: number): number {
  return percentageStats.has(stat) ? Math.round(value * 1000) / 10 : value
}

/** Converts a form-friendly artifact stat value to the internal representation. */
export function fromDisplayStatValue(stat: ArtifactStat, value: number): number {
  return percentageStats.has(stat) ? value / 100 : value
}
