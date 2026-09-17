import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.vermillion-hereafter.2pc.attack-percent"],
      id: "artifact.vermillion-hereafter.2pc.attack-percent",
      label: "辰砂往生录 · 二件套",
      source: artifactSource("VermillionHereafter", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.vermillion-hereafter.4pc.after-burst.attack-percent",
        "artifact.vermillion-hereafter.4pc.after-burst.4-stack.attack-percent"
      ],
      id: "artifact.vermillion-hereafter.4pc.after-burst.attack-percent",
      label: "辰砂往生录 · 四件套（前台爆发后 8%，有有效自身扣血来源默认 48%；后台不计）",
      source: artifactSource("VermillionHereafter", 4),
      status: "implemented"
    }
  ],
  equipmentId: "VermillionHereafter",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
