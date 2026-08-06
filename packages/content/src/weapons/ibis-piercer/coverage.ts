import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.ibis-piercer.precision.1-stack.elemental-mastery",
        "weapon.ibis-piercer.precision.2-stack.elemental-mastery"
      ],
      id: "weapon.ibis-piercer.precision.elemental-mastery",
      label: "鹮穿之喙 · 重击命中后的元素精通层数",
      source: weaponSource("IbisPiercer"),
      status: "implemented"
    }
  ],
  equipmentId: "IbisPiercer",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
