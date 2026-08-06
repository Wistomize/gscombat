import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.scholar.2pc.energy-recharge"],
      id: "artifact.scholar.2pc.energy-recharge",
      label: "学士 · 二件套",
      source: artifactSource("Scholar", 2),
      status: "implemented"
    },
    {
      id: "artifact.scholar.4pc.particle-energy-restoration",
      label: "学士 · 四件套",
      reason: "获得元素微粒或晶球后的队伍能量恢复属于后续循环资源，不改变当前核心动作的一次期望伤害。",
      source: artifactSource("Scholar", 4),
      status: "not_applicable"
    }
  ],
  equipmentId: "Scholar",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
