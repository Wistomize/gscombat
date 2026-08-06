import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.blizzard-strayer.2pc.cryo-damage-bonus"],
      id: "artifact.blizzard-strayer.2pc.cryo-damage-bonus",
      label: "冰风迷途的勇士 · 二件套",
      source: artifactSource("BlizzardStrayer", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.blizzard-strayer.4pc.cryo-aura.crit-rate",
        "artifact.blizzard-strayer.4pc.frozen.crit-rate"
      ],
      id: "artifact.blizzard-strayer.4pc.enemy-state-crit-rate",
      label: "冰风迷途的勇士 · 四件套（冰元素影响与冻结状态）",
      source: artifactSource("BlizzardStrayer", 4),
      status: "implemented"
    }
  ],
  equipmentId: "BlizzardStrayer",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
