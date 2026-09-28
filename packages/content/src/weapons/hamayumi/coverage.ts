import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.hamayumi.normal-damage-bonus",
        "weapon.hamayumi.charged-damage-bonus",
        "weapon.hamayumi.full-energy.normal-damage-bonus",
        "weapon.hamayumi.full-energy.charged-damage-bonus",
        "weapon.hamayumi.full-energy.normal-damage-bonus.disabled",
        "weapon.hamayumi.full-energy.charged-damage-bonus.disabled"
      ],
      id: "weapon.hamayumi.passive",
      label: "破魔之弓 · 浅水玉",
      source: {
        kind: "weapon",
        weaponId: "Hamayumi"
      },
      status: "implemented"
    }
  ],
  equipmentId: "Hamayumi",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
