import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.adventurer.2pc.flat-hp"],
      id: "artifact.adventurer.2pc.flat-hp",
      label: "冒险家 · 二件套（生命值上限）",
      source: artifactSource("Adventurer", 2),
      status: "implemented"
    },
    {
      id: "artifact.adventurer.4pc.chest-healing",
      label: "冒险家 · 四件套（开启宝箱后恢复生命值）",
      reason: "开放世界开启宝箱事件不属于当前选定核心动作。",
      source: artifactSource("Adventurer", 4),
      status: "not_applicable"
    }
  ],
  equipmentId: "Adventurer",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
