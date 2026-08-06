import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.retracing-bolide.2pc.shield-strength"],
      id: "artifact.retracing-bolide.2pc.shield-strength",
      label: "逆飞的流星 · 二件套",
      source: artifactSource("RetracingBolide", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.retracing-bolide.4pc.shielded.normal-charged-damage-bonus"],
      id: "artifact.retracing-bolide.4pc.shielded.normal-charged-damage-bonus",
      label: "逆飞的流星 · 四件套（当前角色处于护盾庇护下）",
      source: artifactSource("RetracingBolide", 4),
      status: "implemented"
    }
  ],
  equipmentId: "RetracingBolide",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
