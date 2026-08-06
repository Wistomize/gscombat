import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.missive-windspear.after-reaction.attack-percent",
        "weapon.missive-windspear.after-reaction.elemental-mastery"
      ],
      id: "weapon.missive-windspear.after-reaction.stats",
      label: "风信之锋 · 触发元素反应后",
      source: weaponSource("MissiveWindspear"),
      status: "implemented"
    }
  ],
  equipmentId: "MissiveWindspear",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
