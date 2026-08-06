import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.resolution-of-sojourner.2pc.attack-percent"],
      id: "artifact.resolution-of-sojourner.2pc.attack-percent",
      label: "行者之心 · 二件套",
      source: artifactSource("ResolutionOfSojourner", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.resolution-of-sojourner.4pc.charged-crit-rate"],
      id: "artifact.resolution-of-sojourner.4pc.charged-crit-rate",
      label: "行者之心 · 四件套",
      source: artifactSource("ResolutionOfSojourner", 4),
      status: "implemented"
    }
  ],
  equipmentId: "ResolutionOfSojourner",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
