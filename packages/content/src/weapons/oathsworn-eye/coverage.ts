import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.oathsworn-eye.after-skill.energy-recharge"],
      id: "weapon.oathsworn-eye.after-skill.energy-recharge",
      label: "证誓之明瞳 · 施放元素战技后",
      source: weaponSource("OathswornEye"),
      status: "implemented"
    }
  ],
  equipmentId: "OathswornEye",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
