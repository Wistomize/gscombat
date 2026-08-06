import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.wanderers-troupe.2pc.elemental-mastery"],
      id: "artifact.wanderers-troupe.2pc.elemental-mastery",
      label: "流浪大地的乐团 · 二件套",
      source: artifactSource("WanderersTroupe", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.wanderers-troupe.4pc.bow-catalyst-charged-damage-bonus"],
      id: "artifact.wanderers-troupe.4pc.bow-catalyst-charged-damage-bonus",
      label: "流浪大地的乐团 · 四件套",
      source: artifactSource("WanderersTroupe", 4),
      status: "implemented"
    }
  ],
  equipmentId: "WanderersTroupe",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
