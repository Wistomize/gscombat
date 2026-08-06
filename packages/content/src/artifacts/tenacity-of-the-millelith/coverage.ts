import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.tenacity-of-the-millelith.2pc.hp-percent"],
      id: "artifact.tenacity-of-the-millelith.2pc.hp-percent",
      label: "千岩牢固 · 二件套",
      source: artifactSource("TenacityOfTheMillelith", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.tenacity-of-the-millelith.4pc.after-skill-hit.party-attack-percent"],
      id: "artifact.tenacity-of-the-millelith.4pc.after-skill-hit.party-attack-percent",
      label: "千岩牢固 · 四件套（队伍中装备者元素战技命中后3秒内）",
      source: artifactSource("TenacityOfTheMillelith", 4, "party_member"),
      status: "implemented"
    },
    {
      effectIds: ["artifact.tenacity-of-the-millelith.4pc.after-skill-hit.party-shield-strength"],
      id: "artifact.tenacity-of-the-millelith.4pc.party-shield-strength",
      label: "千岩牢固 · 四件套（护盾强效）",
      source: artifactSource("TenacityOfTheMillelith", 4, "party_member"),
      status: "implemented"
    }
  ],
  equipmentId: "TenacityOfTheMillelith",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
