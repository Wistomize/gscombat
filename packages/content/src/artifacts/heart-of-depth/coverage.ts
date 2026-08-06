import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.heart-of-depth.2pc.hydro-damage-bonus"],
      id: "artifact.heart-of-depth.2pc.hydro-damage-bonus",
      label: "沉沦之心 · 二件套",
      source: artifactSource("HeartOfDepth", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.heart-of-depth.4pc.after-skill.normal-charged-damage-bonus"],
      id: "artifact.heart-of-depth.4pc.after-skill.normal-charged-damage-bonus",
      label: "沉沦之心 · 四件套（元素战技后）",
      source: artifactSource("HeartOfDepth", 4),
      status: "implemented"
    }
  ],
  equipmentId: "HeartOfDepth",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
