import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.silken-moons-serenade.2pc.energy-recharge"],
      id: "artifact.silken-moons-serenade.2pc.energy-recharge",
      label: "纺月的夜歌 · 二件套",
      source: artifactSource("SilkenMoonsSerenade", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.silken-moons-serenade.4pc.moonlit-glow.initial-moonsign.party-elemental-mastery",
        "artifact.silken-moons-serenade.4pc.moonlit-glow.full-moonsign.party-elemental-mastery"
      ],
      id: "artifact.silken-moons-serenade.4pc.moonlit-glow.moonsign-party-elemental-mastery",
      label: "纺月的夜歌 · 四件套（月辉明光·崇信的队伍元素精通）",
      source: artifactSource("SilkenMoonsSerenade", 4, "party_member"),
      status: "implemented"
    },
    {
      effectIds: ["artifact.silken-moons-serenade.4pc.different-moongleam.lunar-reaction-damage-bonus"],
      id: "artifact.silken-moons-serenade.4pc.different-moongleam.lunar-reaction-damage-bonus",
      label: "纺月的夜歌 · 四件套（不同月辉明光的月曜反应伤害）",
      source: artifactSource("SilkenMoonsSerenade", 4, "party_member"),
      status: "implemented"
    }
  ],
  equipmentId: "SilkenMoonsSerenade",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
