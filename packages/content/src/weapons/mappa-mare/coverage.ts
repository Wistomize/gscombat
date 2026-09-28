import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.mappa-mare.infusion-scroll.2-stack.all-element-damage-bonus"
      ],
      id: "weapon.mappa-mare.infusion-scroll.all-element-damage-bonus",
      label: "万国诸海图谱 · 触发元素反应后的所有元素伤害层数",
      source: {
        kind: "weapon",
        weaponId: "MappaMare"
      },
      status: "implemented"
    }
  ],
  equipmentId: "MappaMare",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
