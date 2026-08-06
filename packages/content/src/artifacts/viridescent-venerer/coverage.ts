import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.viridescent-venerer.2pc.anemo-damage-bonus"],
      id: "artifact.viridescent-venerer.2pc.anemo-damage-bonus",
      label: "翠绿之影 · 二件套",
      source: artifactSource("ViridescentVenerer", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.viridescent-venerer.4pc.after-pyro-swirl.pyro-resistance-shred",
        "artifact.viridescent-venerer.4pc.after-hydro-swirl.hydro-resistance-shred",
        "artifact.viridescent-venerer.4pc.after-electro-swirl.electro-resistance-shred",
        "artifact.viridescent-venerer.4pc.after-cryo-swirl.cryo-resistance-shred"
      ],
      id: "artifact.viridescent-venerer.4pc.swirled-element-resistance-shred",
      label: "翠绿之影 · 四件套（装备者扩散对应元素后）",
      source: artifactSource("ViridescentVenerer", 4, "party_member"),
      status: "implemented"
    },
    {
      effectIds: ["artifact.viridescent-venerer.4pc.swirl.reaction-damage-bonus"],
      id: "artifact.viridescent-venerer.4pc.swirl.reaction-damage-bonus",
      label: "翠绿之影 · 四件套（扩散反应伤害）",
      source: artifactSource("ViridescentVenerer", 4),
      status: "implemented"
    }
  ],
  equipmentId: "ViridescentVenerer",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
