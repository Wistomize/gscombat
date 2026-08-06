import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.kitain-cross-spear.skill-damage-bonus"],
      id: "weapon.kitain-cross-spear.skill-damage-bonus",
      label: "喜多院十文字 · 元素战技伤害",
      source: weaponSource("KitainCrossSpear"),
      status: "implemented"
    },
    {
      id: "weapon.kitain-cross-spear.skill-energy-cycle",
      label: "喜多院十文字 · 元素战技后元素能量流转",
      reason: "元素能量消耗与分段恢复改变后续循环资源，不改变当前核心动作的一次期望伤害。",
      source: weaponSource("KitainCrossSpear"),
      status: "not_applicable"
    }
  ],
  equipmentId: "KitainCrossSpear",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
