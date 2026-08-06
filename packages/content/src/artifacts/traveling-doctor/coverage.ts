import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.traveling-doctor.2pc.incoming-healing-bonus"],
      id: "artifact.traveling-doctor.2pc.incoming-healing-bonus",
      label: "游医 · 二件套（受到的治疗效果）",
      source: artifactSource("TravelingDoctor", 2),
      status: "implemented"
    },
    {
      id: "artifact.traveling-doctor.4pc.burst-self-healing",
      label: "游医 · 四件套（施放元素爆发后的生命值恢复）",
      reason: "游医最高稀有度为3星，按当前范围不维护其四件套独立辅助指标。",
      source: artifactSource("TravelingDoctor", 4),
      status: "not_applicable"
    }
  ],
  equipmentId: "TravelingDoctor",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
