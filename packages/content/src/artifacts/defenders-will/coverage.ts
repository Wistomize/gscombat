import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.defenders-will.2pc.defense-percent"],
      id: "artifact.defenders-will.2pc.defense-percent",
      label: "守护之心 · 二件套",
      source: artifactSource("DefendersWill", 2),
      status: "implemented"
    },
    {
      id: "artifact.defenders-will.4pc.party-element-resistance",
      label: "守护之心 · 四件套",
      reason: "用户确认本轮不计入此条款。需要队伍元素构成统计与承伤元素抗性指标。",
      source: artifactSource("DefendersWill", 4),
      status: "not_applicable"
    }
  ],
  equipmentId: "DefendersWill",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
