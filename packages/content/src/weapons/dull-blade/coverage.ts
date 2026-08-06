import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.dull-blade.passive.none",
      label: "无锋剑 · 无武器技能",
      reason: "该武器没有被动效果；基础面板仍由装备数据处理。",
      source: weaponSource("DullBlade"),
      status: "not_applicable"
    }
  ],
  equipmentId: "DullBlade",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
