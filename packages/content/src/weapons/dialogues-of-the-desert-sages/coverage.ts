import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.dialogues-of-the-desert-sages.after-healing.energy-restoration",
      label: "沙中伟贤的对答 · 治疗后恢复元素能量",
      reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
      source: weaponSource("DialoguesOfTheDesertSages"),
      status: "not_applicable"
    }
  ],
  equipmentId: "DialoguesOfTheDesertSages",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
