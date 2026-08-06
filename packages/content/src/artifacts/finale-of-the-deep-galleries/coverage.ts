import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.finale-of-the-deep-galleries.2pc.cryo-damage-bonus"],
      id: "artifact.finale-of-the-deep-galleries.2pc.cryo-damage-bonus",
      label: "深廊终曲 · 二件套",
      source: artifactSource("FinaleOfTheDeepGalleries", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.finale-of-the-deep-galleries.4pc.zero-energy.normal-damage-bonus",
        "artifact.finale-of-the-deep-galleries.4pc.zero-energy.burst-damage-bonus"
      ],
      id: "artifact.finale-of-the-deep-galleries.4pc.zero-energy-damage-bonus",
      label: "深廊终曲 · 四件套（元素能量为0的普通攻击或元素爆发）",
      source: artifactSource("FinaleOfTheDeepGalleries", 4),
      status: "implemented"
    }
  ],
  equipmentId: "FinaleOfTheDeepGalleries",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
