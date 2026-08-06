import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "artifact.tiny-miracle.2pc.all-element-resistance",
      label: "奇迹 · 二件套（所有元素抗性）",
      reason: "当前指标流水线未建模承伤元素抗性或防御指标。",
      requiredCapability: "incoming_elemental_resistance_metric",
      source: artifactSource("TinyMiracle", 2),
      status: "unsupported"
    },
    {
      id: "artifact.tiny-miracle.4pc.after-elemental-damage-resistance",
      label: "奇迹 · 四件套（受到对应元素伤害后的元素抗性）",
      reason: "需要承伤元素抗性指标、受击元素和冷却窗口状态。",
      requiredCapability: "incoming_elemental_resistance_metric_and_damage_event",
      source: artifactSource("TinyMiracle", 4),
      status: "unsupported"
    }
  ],
  equipmentId: "TinyMiracle",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
