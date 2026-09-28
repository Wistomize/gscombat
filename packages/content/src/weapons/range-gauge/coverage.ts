import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.range-gauge.unity.3-mark.attack-percent",
        "weapon.range-gauge.unity.3-mark.all-element-damage-bonus"
      ],
      id: "weapon.range-gauge.unity.stats",
      label: "测距规 · 消耗团结标记后的攻击力与所有元素伤害",
      source: {
        kind: "weapon",
        weaponId: "RangeGauge"
      },
      status: "implemented"
    }
  ],
  equipmentId: "RangeGauge",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
