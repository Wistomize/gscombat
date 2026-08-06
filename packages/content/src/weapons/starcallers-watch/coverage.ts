import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.starcallers-watch.elemental-mastery", "weapon.starcallers-watch.shielded.damage-bonus"],
      id: "weapon.starcallers-watch.passive",
      label: "祭星者之望 · 星芒的显迹",
      source: weaponSource("StarcallersWatch"),
      status: "implemented"
    }
  ],
  equipmentId: "StarcallersWatch",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
