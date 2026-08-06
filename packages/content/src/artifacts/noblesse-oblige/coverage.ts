import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.noblesse-oblige.2pc.burst-damage-bonus"],
      id: "artifact.noblesse-oblige.2pc",
      label: "昔日宗室之仪 · 二件套",
      source: artifactSource("NoblesseOblige", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.noblesse-oblige.4pc-attack"],
      id: "artifact.noblesse-oblige.4pc-attack",
      label: "昔日宗室之仪 · 四件套",
      source: artifactSource("NoblesseOblige", 4, "party_member"),
      status: "implemented"
    }
  ],
  equipmentId: "NoblesseOblige",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
