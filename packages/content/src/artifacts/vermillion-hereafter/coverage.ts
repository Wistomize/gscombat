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
        "artifact.vermillion-hereafter.4pc.after-burst.1-stack.attack-percent",
        "artifact.vermillion-hereafter.4pc.after-burst.2-stack.attack-percent",
        "artifact.vermillion-hereafter.4pc.after-burst.3-stack.attack-percent",
        "artifact.vermillion-hereafter.4pc.after-burst.4-stack.attack-percent"
      ],
      id: "artifact.vermillion-hereafter.4pc.after-burst.attack-percent",
      label: "辰砂往生录 · 四件套（爆发后生命值降低层数对应的攻击力）",
      source: artifactSource("VermillionHereafter", 4),
      status: "implemented"
    }
  ],
  equipmentId: "VermillionHereafter",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
