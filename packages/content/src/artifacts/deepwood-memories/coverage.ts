import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.deepwood-memories.2pc.dendro-damage-bonus"],
      id: "artifact.deepwood-memories.2pc.dendro-damage-bonus",
      label: "深林的记忆 · 二件套",
      source: artifactSource("DeepwoodMemories", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.deepwood-memories.4pc.dendro-resistance-shred"],
      id: "artifact.deepwood-memories.4pc.dendro-resistance-shred",
      label: "深林的记忆 · 四件套（元素战技或元素爆发命中后）",
      source: artifactSource("DeepwoodMemories", 4, "party_member"),
      status: "implemented"
    }
  ],
  equipmentId: "DeepwoodMemories",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
