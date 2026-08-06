import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.obsidian-codex.2pc.nightsoul-blessing.damage-bonus"],
      id: "artifact.obsidian-codex.2pc.nightsoul-blessing.damage-bonus",
      label: "黑曜秘典 · 二件套（前台且处于夜魂加持状态）",
      source: artifactSource("ObsidianCodex", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.obsidian-codex.4pc.after-nightsoul-consumption.crit-rate"],
      id: "artifact.obsidian-codex.4pc.after-nightsoul-consumption.crit-rate",
      label: "黑曜秘典 · 四件套（消耗夜魂值后）",
      source: artifactSource("ObsidianCodex", 4),
      status: "implemented"
    }
  ],
  equipmentId: "ObsidianCodex",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
