import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.jadefalls-splendor.after-burst-or-shield.final-hp-to-own-element-damage-bonus"],
      id: "weapon.jadefalls-splendor.hp-scaled-elemental-damage-bonus",
      label: "碧落之珑 · 按生命值上限的元素伤害",
      source: weaponSource("JadefallsSplendor"),
      status: "implemented"
    },
    {
      id: "weapon.jadefalls-splendor.after-burst.energy-restoration",
      label: "碧落之珑 · 元素爆发后元素能量恢复",
      reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
      source: weaponSource("JadefallsSplendor"),
      status: "not_applicable"
    }
  ],
  equipmentId: "JadefallsSplendor",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
