import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.alley-hunter.off-field.10-stack.damage-bonus"
      ],
      id: "weapon.alley-hunter.off-field-damage-bonus",
      label: "暗巷猎手 · 后台累积伤害提升与登场后衰减",
      source: {
        kind: "weapon",
        weaponId: "AlleyHunter"
      },
      status: "implemented"
    }
  ],
  equipmentId: "AlleyHunter",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
