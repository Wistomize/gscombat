import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.instructor.2pc.elemental-mastery"],
      id: "artifact.instructor.2pc.elemental-mastery",
      label: "教官 · 二件套",
      source: artifactSource("Instructor", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.instructor.4pc.after-reaction.party-elemental-mastery"],
      id: "artifact.instructor.4pc.after-reaction.party-elemental-mastery",
      label: "教官 · 四件套（装备者触发元素反应后）",
      source: artifactSource("Instructor", 4, "party_member"),
      status: "implemented"
    }
  ],
  equipmentId: "Instructor",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
