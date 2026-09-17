import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "artifact.tiny-miracle.2pc.all-element-resistance",
      label: "奇迹 · 二件套（所有元素抗性）",
      reason: "用户确认本轮不计入此条款。当前指标流水线未建模承伤元素抗性或防御指标。",
      source: artifactSource("TinyMiracle", 2),
      status: "not_applicable"
    },
    {
      id: "artifact.tiny-miracle.4pc.after-elemental-damage-resistance",
      label: "奇迹 · 四件套（受到对应元素伤害后的元素抗性）",
      reason: "用户确认本轮不计入此条款。需要承伤元素抗性指标、受击元素和冷却窗口状态。",
      source: artifactSource("TinyMiracle", 4),
      status: "not_applicable"
    }
  ],
  equipmentId: "TinyMiracle",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
