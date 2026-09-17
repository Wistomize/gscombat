import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.husk-of-opulent-dreams.2pc.defense-percent"],
      id: "artifact.husk-of-opulent-dreams.2pc.defense-percent",
      label: "华馆梦醒形骸记 · 二件套",
      source: artifactSource("HuskOfOpulentDreams", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.husk-of-opulent-dreams.4pc.curiosity.4-stack.defense-percent",
        "artifact.husk-of-opulent-dreams.4pc.curiosity.4-stack.geo-damage-bonus"
      ],
      id: "artifact.husk-of-opulent-dreams.4pc.curiosity-stacks",
      label: "华馆梦醒形骸记 · 四件套（后台默认四层；前台需自身岩元素攻击能力，旧中间层不计）",
      source: artifactSource("HuskOfOpulentDreams", 4),
      status: "implemented"
    }
  ],
  equipmentId: "HuskOfOpulentDreams",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
