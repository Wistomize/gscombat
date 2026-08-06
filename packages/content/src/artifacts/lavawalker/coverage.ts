import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "artifact.lavawalker.2pc.pyro-resistance",
      label: "渡过烈火的贤人 · 二件套",
      reason: "需要承伤元素抗性指标。",
      requiredCapability: "incoming_elemental_resistance_metric",
      source: artifactSource("Lavawalker", 2),
      status: "unsupported"
    },
    {
      effectIds: ["artifact.lavawalker.4pc.pyro-aura.damage-bonus"],
      id: "artifact.lavawalker.4pc.pyro-aura.damage-bonus",
      label: "渡过烈火的贤人 · 四件套（当前目标受火元素影响）",
      source: artifactSource("Lavawalker", 4),
      status: "implemented"
    }
  ],
  equipmentId: "Lavawalker",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
