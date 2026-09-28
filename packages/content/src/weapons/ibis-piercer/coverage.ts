import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.ibis-piercer.precision.2-stack.elemental-mastery"
      ],
      id: "weapon.ibis-piercer.precision.elemental-mastery",
      label: "鹮穿之喙 · 重击命中后的元素精通层数",
      source: {
        kind: "weapon",
        weaponId: "IbisPiercer"
      },
      status: "implemented"
    }
  ],
  equipmentId: "IbisPiercer",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
