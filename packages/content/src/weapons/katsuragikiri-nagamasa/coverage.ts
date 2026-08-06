import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.katsuragikiri-nagamasa.skill-damage-bonus"],
      id: "weapon.katsuragikiri-nagamasa.skill-damage-bonus",
      label: "桂木斩长正 · 元素战技伤害",
      source: weaponSource("KatsuragikiriNagamasa"),
      status: "implemented"
    },
    {
      id: "weapon.katsuragikiri-nagamasa.skill-energy-cycle",
      label: "桂木斩长正 · 元素战技后元素能量流转",
      reason: "元素能量消耗与分段恢复改变后续循环资源，不改变当前核心动作的一次期望伤害。",
      source: weaponSource("KatsuragikiriNagamasa"),
      status: "not_applicable"
    }
  ],
  equipmentId: "KatsuragikiriNagamasa",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
