import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.mappa-mare.infusion-scroll.1-stack.all-element-damage-bonus",
        "weapon.mappa-mare.infusion-scroll.2-stack.all-element-damage-bonus"
      ],
      id: "weapon.mappa-mare.infusion-scroll.all-element-damage-bonus",
      label: "万国诸海图谱 · 触发元素反应后的所有元素伤害层数",
      source: weaponSource("MappaMare"),
      status: "implemented"
    }
  ],
  equipmentId: "MappaMare",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
