import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.hamayumi.normal-damage-bonus",
        "weapon.hamayumi.charged-damage-bonus",
        "weapon.hamayumi.full-energy.normal-damage-bonus",
        "weapon.hamayumi.full-energy.charged-damage-bonus"
      ],
      id: "weapon.hamayumi.passive",
      label: "破魔之弓 · 浅水玉",
      source: weaponSource("Hamayumi"),
      status: "implemented"
    }
  ],
  equipmentId: "Hamayumi",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
