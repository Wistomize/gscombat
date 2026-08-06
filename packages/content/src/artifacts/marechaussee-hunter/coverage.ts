import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.marechaussee-hunter.2pc.normal-charged-damage-bonus"],
      id: "artifact.marechaussee-hunter.2pc.normal-charged-damage-bonus",
      label: "逐影猎人 · 二件套",
      source: artifactSource("MarechausseeHunter", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.marechaussee-hunter.4pc.hp-change.1-stack.crit-rate",
        "artifact.marechaussee-hunter.4pc.hp-change.2-stack.crit-rate",
        "artifact.marechaussee-hunter.4pc.hp-change.3-stack.crit-rate"
      ],
      id: "artifact.marechaussee-hunter.4pc.hp-change-crit-rate-stacks",
      label: "逐影猎人 · 四件套（生命值变化后的暴击率层数）",
      source: artifactSource("MarechausseeHunter", 4),
      status: "implemented"
    }
  ],
  equipmentId: "MarechausseeHunter",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
