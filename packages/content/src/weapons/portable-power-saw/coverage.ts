import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.portable-power-saw.mariners-resolve.1-mark.elemental-mastery",
        "weapon.portable-power-saw.mariners-resolve.2-mark.elemental-mastery",
        "weapon.portable-power-saw.mariners-resolve.3-mark.elemental-mastery"
      ],
      id: "weapon.portable-power-saw.mariners-resolve.elemental-mastery",
      label: "便携动力锯 · 消耗坚忍标记后的元素精通",
      source: weaponSource("PortablePowerSaw"),
      status: "implemented"
    },
    {
      id: "weapon.portable-power-saw.mariners-resolve.delayed-energy-restoration",
      label: "便携动力锯 · 消耗坚忍标记后的延迟元素能量恢复",
      reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
      source: weaponSource("PortablePowerSaw"),
      status: "not_applicable"
    }
  ],
  equipmentId: "PortablePowerSaw",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
