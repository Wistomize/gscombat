import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.tidal-shadow.after-heal.attack-percent"],
      id: "weapon.tidal-shadow.after-heal.attack-percent",
      label: "浪影阔剑 · 受到治疗后",
      source: weaponSource("TidalShadow"),
      status: "implemented"
    }
  ],
  equipmentId: "TidalShadow",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
