import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.the-catch.burst-crit-rate", "weapon.the-catch.burst-damage-bonus"],
      id: "weapon.the-catch.burst",
      label: "「渔获」· 船歌",
      source: weaponSource("TheCatch"),
      status: "implemented"
    }
  ],
  equipmentId: "TheCatch",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
