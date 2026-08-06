import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.the-exile.2pc.energy-recharge"],
      id: "artifact.the-exile.2pc.energy-recharge",
      label: "流放者 · 二件套",
      source: artifactSource("TheExile", 2),
      status: "implemented"
    },
    {
      id: "artifact.the-exile.4pc.burst-energy-restoration",
      label: "流放者 · 四件套",
      reason: "施放元素爆发后的队伍能量恢复属于后续循环资源，不改变当前核心动作的一次期望伤害。",
      source: artifactSource("TheExile", 4),
      status: "not_applicable"
    }
  ],
  equipmentId: "TheExile",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
