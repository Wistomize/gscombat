import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "artifact.thundersoother.2pc.electro-resistance",
      label: "平息鸣雷的尊者 · 二件套",
      reason: "需要承伤元素抗性指标。",
      requiredCapability: "incoming_elemental_resistance_metric",
      source: artifactSource("Thundersoother", 2),
      status: "unsupported"
    },
    {
      effectIds: ["artifact.thundersoother.4pc.electro-aura.damage-bonus"],
      id: "artifact.thundersoother.4pc.electro-aura.damage-bonus",
      label: "平息鸣雷的尊者 · 四件套（当前目标受雷元素影响）",
      source: artifactSource("Thundersoother", 4),
      status: "implemented"
    }
  ],
  equipmentId: "Thundersoother",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
