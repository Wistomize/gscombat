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
        "artifact.unfinished-reverie.4pc.out-of-combat-nearby-burning-or-post-burning-grace.damage-bonus"
      ],
      id: "artifact.unfinished-reverie.4pc.combat-and-burning-state-damage-bonus",
      label: "未竟的遐思 · 四件套（队伍同时有火草默认 50%，前后台均可；旧衰减档位不计）",
      source: artifactSource("UnfinishedReverie", 4),
      status: "implemented"
    }
  ],
  equipmentId: "UnfinishedReverie",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
