import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.maiden-beloved.2pc.healing-bonus"],
      id: "artifact.maiden-beloved.2pc.healing-bonus",
      label: "被怜爱的少女 · 二件套（治疗加成）",
      source: artifactSource("MaidenBeloved", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.maiden-beloved.4pc.after-skill-or-burst.party-incoming-healing-bonus"],
      id: "artifact.maiden-beloved.4pc.after-skill-or-burst.party-incoming-healing-bonus",
      label: "被怜爱的少女 · 四件套（施放元素战技或元素爆发后的队伍受治疗效果）",
      source: artifactSource("MaidenBeloved", 4, "party_member"),
      status: "implemented"
    }
  ],
  equipmentId: "MaidenBeloved",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
