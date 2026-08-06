import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.emblem-of-severed-fate.2pc.energy-recharge"],
      id: "artifact.emblem-of-severed-fate.2pc",
      label: "绝缘之旗印 · 二件套",
      source: artifactSource("EmblemOfSeveredFate", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.emblem-of-severed-fate.4pc.burst-damage-bonus"],
      id: "artifact.emblem-of-severed-fate.4pc",
      label: "绝缘之旗印 · 四件套",
      source: artifactSource("EmblemOfSeveredFate", 4),
      status: "implemented"
    }
  ],
  equipmentId: "EmblemOfSeveredFate",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
