import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.amenoma-kageuchi.inheritance-seed.energy-restoration",
      label: "天目影打刀 · 胤种清除后的元素能量恢复",
      reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
      source: weaponSource("AmenomaKageuchi"),
      status: "not_applicable"
    }
  ],
  equipmentId: "AmenomaKageuchi",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
