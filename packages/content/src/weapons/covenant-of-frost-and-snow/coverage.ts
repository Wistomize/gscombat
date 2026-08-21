import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed 7.0 coverage for Covenant of Frost and Snow. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.covenant-of-frost-and-snow.after-skill.elemental-mastery"],
      id: "weapon.covenant-of-frost-and-snow.after-skill.elemental-mastery",
      label: "霜雪誓约 · 施放元素战技后的元素精通",
      source: weaponSource("CovenantOfFrostAndSnow"),
      status: "implemented"
    }
  ],
  equipmentId: "CovenantOfFrostAndSnow",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
