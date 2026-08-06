import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.unfinished-reverie.2pc.attack-percent"],
      id: "artifact.unfinished-reverie.2pc.attack-percent",
      label: "未竟的遐思 · 二件套",
      source: artifactSource("UnfinishedReverie", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.unfinished-reverie.4pc.post-burning.grace-expired.1-second.damage-bonus",
        "artifact.unfinished-reverie.4pc.post-burning.grace-expired.2-second.damage-bonus",
        "artifact.unfinished-reverie.4pc.post-burning.grace-expired.3-second.damage-bonus",
        "artifact.unfinished-reverie.4pc.post-burning.grace-expired.4-second.damage-bonus",
        "artifact.unfinished-reverie.4pc.out-of-combat-nearby-burning-or-post-burning-grace.damage-bonus"
      ],
      id: "artifact.unfinished-reverie.4pc.combat-and-burning-state-damage-bonus",
      label: "未竟的遐思 · 四件套（脱战、附近燃烧与6秒宽限期后的逐秒全伤档位）",
      source: artifactSource("UnfinishedReverie", 4),
      status: "implemented"
    }
  ],
  equipmentId: "UnfinishedReverie",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
