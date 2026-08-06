import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.brave-heart.2pc.attack-percent"],
      id: "artifact.brave-heart.2pc.attack-percent",
      label: "勇士之心 · 二件套",
      source: artifactSource("BraveHeart", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.brave-heart.4pc.enemy-above-half-health.damage-bonus"],
      id: "artifact.brave-heart.4pc.enemy-above-half-health.damage-bonus",
      label: "勇士之心 · 四件套（当前目标生命值高于50%）",
      source: artifactSource("BraveHeart", 4),
      status: "implemented"
    }
  ],
  equipmentId: "BraveHeart",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
