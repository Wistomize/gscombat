import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.rightful-reward.after-healing.energy-restoration",
      label: "公义的酬报 · 受治疗后的元素能量恢复",
      reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
      source: weaponSource("RightfulReward"),
      status: "not_applicable"
    }
  ],
  equipmentId: "RightfulReward",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
