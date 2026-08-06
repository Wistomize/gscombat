import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "artifact.prayers-to-springtime.1pc.cryo-aura-duration",
      label: "祭冰之人 · 一件套（冰元素附着持续时间）",
      reason: "当前模型将元素状态作为已选快照，不追踪元素附着时长或循环时间线。",
      source: artifactSource("PrayersToSpringtime", 1),
      status: "not_applicable"
    }
  ],
  equipmentId: "PrayersToSpringtime",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
