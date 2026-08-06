import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.nymphs-dream.2pc.hydro-damage-bonus"],
      id: "artifact.nymphs-dream.2pc.hydro-damage-bonus",
      label: "水仙之梦 · 二件套",
      source: artifactSource("NymphsDream", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.nymphs-dream.4pc.mirrored-nymph.1-stack.attack-percent",
        "artifact.nymphs-dream.4pc.mirrored-nymph.1-stack.hydro-damage-bonus",
        "artifact.nymphs-dream.4pc.mirrored-nymph.2-stack.attack-percent",
        "artifact.nymphs-dream.4pc.mirrored-nymph.2-stack.hydro-damage-bonus",
        "artifact.nymphs-dream.4pc.mirrored-nymph.3-stack.attack-percent",
        "artifact.nymphs-dream.4pc.mirrored-nymph.3-stack.hydro-damage-bonus"
      ],
      id: "artifact.nymphs-dream.4pc.mirrored-nymph-stacks",
      label: "水仙之梦 · 四件套（镜中水仙层数）",
      source: artifactSource("NymphsDream", 4),
      status: "implemented"
    }
  ],
  equipmentId: "NymphsDream",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
