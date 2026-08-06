import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.range-gauge.unity.1-mark.attack-percent",
        "weapon.range-gauge.unity.1-mark.all-element-damage-bonus",
        "weapon.range-gauge.unity.2-mark.attack-percent",
        "weapon.range-gauge.unity.2-mark.all-element-damage-bonus",
        "weapon.range-gauge.unity.3-mark.attack-percent",
        "weapon.range-gauge.unity.3-mark.all-element-damage-bonus"
      ],
      id: "weapon.range-gauge.unity.stats",
      label: "测距规 · 消耗团结标记后的攻击力与所有元素伤害",
      source: weaponSource("RangeGauge"),
      status: "implemented"
    }
  ],
  equipmentId: "RangeGauge",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
