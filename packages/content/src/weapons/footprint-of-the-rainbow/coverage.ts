import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.footprint-of-the-rainbow.after-skill.defense-percent"],
      id: "weapon.footprint-of-the-rainbow.after-skill.defense-percent",
      label: "虹的行迹 · 施放元素战技后",
      source: weaponSource("FootprintOfTheRainbow"),
      status: "implemented"
    }
  ],
  equipmentId: "FootprintOfTheRainbow",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
