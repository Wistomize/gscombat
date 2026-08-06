import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.dawning-frost.after-charged-hit.elemental-mastery",
        "weapon.dawning-frost.after-skill-hit.elemental-mastery"
      ],
      id: "weapon.dawning-frost.elemental-mastery-windows",
      label: "霜辰 · 不凋之约",
      source: weaponSource("DawningFrost"),
      status: "implemented"
    }
  ],
  equipmentId: "DawningFrost",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
