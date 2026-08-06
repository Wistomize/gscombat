import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.berserker.2pc.crit-rate"],
      id: "artifact.berserker.2pc.crit-rate",
      label: "战狂 · 二件套",
      source: artifactSource("Berserker", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.berserker.4pc.low-hp-crit-rate"],
      id: "artifact.berserker.4pc.low-hp-crit-rate",
      label: "战狂 · 四件套（当前生命值低于70%）",
      source: artifactSource("Berserker", 4),
      status: "implemented"
    }
  ],
  equipmentId: "Berserker",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
