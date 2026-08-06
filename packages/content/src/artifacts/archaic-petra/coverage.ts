import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.archaic-petra.2pc.geo-damage-bonus"],
      id: "artifact.archaic-petra.2pc.geo-damage-bonus",
      label: "悠古的磐岩 · 二件套",
      source: artifactSource("ArchaicPetra", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.archaic-petra.4pc.crystallize.pyro-damage-bonus",
        "artifact.archaic-petra.4pc.crystallize.hydro-damage-bonus",
        "artifact.archaic-petra.4pc.crystallize.electro-damage-bonus",
        "artifact.archaic-petra.4pc.crystallize.cryo-damage-bonus"
      ],
      id: "artifact.archaic-petra.4pc.crystallize-element-damage-bonus",
      label: "悠古的磐岩 · 四件套（拾取对应元素结晶反应的晶片后）",
      source: artifactSource("ArchaicPetra", 4, "party_member"),
      status: "implemented"
    }
  ],
  equipmentId: "ArchaicPetra",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
