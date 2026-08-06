import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.pale-flame.2pc.physical-damage-bonus"],
      id: "artifact.pale-flame.2pc.physical-damage-bonus",
      label: "苍白之火 · 二件套",
      source: artifactSource("PaleFlame", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.pale-flame.4pc.skill-hit.1-stack.attack-percent",
        "artifact.pale-flame.4pc.skill-hit.2-stack.attack-percent",
        "artifact.pale-flame.4pc.skill-hit.2-stack.extra-physical-damage-bonus"
      ],
      id: "artifact.pale-flame.4pc.skill-hit-stacks",
      label: "苍白之火 · 四件套（元素战技命中后的层数与满层物理伤害翻倍）",
      source: artifactSource("PaleFlame", 4),
      status: "implemented"
    }
  ],
  equipmentId: "PaleFlame",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
