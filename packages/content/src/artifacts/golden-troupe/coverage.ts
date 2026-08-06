import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.golden-troupe.2pc.skill-damage-bonus"],
      id: "artifact.golden-troupe.2pc.skill-damage-bonus",
      label: "黄金剧团 · 二件套",
      source: artifactSource("GoldenTroupe", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.golden-troupe.4pc.on-field.skill-damage-bonus"],
      id: "artifact.golden-troupe.4pc.on-field.skill-damage-bonus",
      label: "黄金剧团 · 四件套（前台元素战技）",
      source: artifactSource("GoldenTroupe", 4),
      status: "implemented"
    },
    {
      id: "artifact.golden-troupe.4pc.off-field.additional-skill-damage-bonus",
      label: "黄金剧团 · 四件套（后台额外元素战技伤害）",
      reason: "当前核心动作由 primary 配置在前台结算；后台额外加成不可能同时作用于该次命中。",
      source: artifactSource("GoldenTroupe", 4),
      status: "not_applicable"
    }
  ],
  equipmentId: "GoldenTroupe",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
