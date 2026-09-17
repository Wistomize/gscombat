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
      label: "黄金剧团 · 四件套（常驻基础 25% 战技增伤，前后台均保留）",
      source: artifactSource("GoldenTroupe", 4),
      status: "implemented"
    },
    {
      id: "artifact.golden-troupe.4pc.off-field.additional-skill-damage-bonus",
      label: "黄金剧团 · 四件套（后台额外元素战技伤害）",
      effectIds: ["artifact.golden-troupe.4pc.off-field.additional-skill-damage-bonus"],
      source: artifactSource("GoldenTroupe", 4),
      status: "implemented"
    }
  ],
  equipmentId: "GoldenTroupe",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
