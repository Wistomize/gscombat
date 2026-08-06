import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.a-day-carved-from-rising-winds.2pc.attack-percent"],
      id: "artifact.a-day-carved-from-rising-winds.2pc.attack-percent",
      label: "风起之日 · 二件套",
      source: artifactSource("ADayCarvedFromRisingWinds", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.a-day-carved-from-rising-winds.4pc.after-hit.attack-percent",
        "artifact.a-day-carved-from-rising-winds.4pc.completed-magical-trial.crit-rate"
      ],
      id: "artifact.a-day-carved-from-rising-winds.4pc.current-state-bonuses",
      label: "风起之日 · 四件套（攻击命中与完成魔女的课业后的状态）",
      source: artifactSource("ADayCarvedFromRisingWinds", 4),
      status: "implemented"
    }
  ],
  equipmentId: "ADayCarvedFromRisingWinds",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
