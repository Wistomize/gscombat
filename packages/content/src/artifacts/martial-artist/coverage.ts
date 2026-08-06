import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.martial-artist.2pc.normal-charged-damage-bonus"],
      id: "artifact.martial-artist.2pc.normal-charged-damage-bonus",
      label: "武人 · 二件套",
      source: artifactSource("MartialArtist", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.martial-artist.4pc.after-skill.normal-charged-damage-bonus"],
      id: "artifact.martial-artist.4pc.after-skill.normal-charged-damage-bonus",
      label: "武人 · 四件套（元素战技后8秒内）",
      source: artifactSource("MartialArtist", 4),
      status: "implemented"
    }
  ],
  equipmentId: "MartialArtist",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
