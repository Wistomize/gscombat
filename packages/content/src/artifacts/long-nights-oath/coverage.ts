import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.long-nights-oath.2pc.plunge-damage-bonus"],
      id: "artifact.long-nights-oath.2pc.plunge-damage-bonus",
      label: "长夜之誓 · 二件套",
      source: artifactSource("LongNightsOath", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.long-nights-oath.4pc.radiance-everlasting.1-stack.plunge-damage-bonus",
        "artifact.long-nights-oath.4pc.radiance-everlasting.2-stack.plunge-damage-bonus",
        "artifact.long-nights-oath.4pc.radiance-everlasting.3-stack.plunge-damage-bonus",
        "artifact.long-nights-oath.4pc.radiance-everlasting.4-stack.plunge-damage-bonus",
        "artifact.long-nights-oath.4pc.radiance-everlasting.5-stack.plunge-damage-bonus"
      ],
      id: "artifact.long-nights-oath.4pc.plunge-stack-bonus",
      label: "长夜之誓 · 四件套（下落、重击与元素战技命中的下落攻击层数）",
      source: artifactSource("LongNightsOath", 4),
      status: "implemented"
    }
  ],
  equipmentId: "LongNightsOath",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
