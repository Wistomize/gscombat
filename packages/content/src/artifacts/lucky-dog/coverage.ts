import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.lucky-dog.2pc.flat-defense"],
      id: "artifact.lucky-dog.2pc.flat-defense",
      label: "幸运儿 · 二件套（防御力）",
      source: artifactSource("LuckyDog", 2),
      status: "implemented"
    },
    {
      id: "artifact.lucky-dog.4pc.mora-healing",
      label: "幸运儿 · 四件套（拾取摩拉后恢复生命值）",
      reason: "开放世界拾取事件不属于当前选定核心动作。",
      source: artifactSource("LuckyDog", 4),
      status: "not_applicable"
    }
  ],
  equipmentId: "LuckyDog",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
