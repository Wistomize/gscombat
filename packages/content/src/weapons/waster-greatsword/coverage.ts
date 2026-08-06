import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.waster-greatsword.no-passive",
      label: "训练大剑 · 无武器技能",
      reason: "该武器没有被动效果；基础面板仍由装备数据处理。",
      source: weaponSource("WasterGreatsword"),
      status: "not_applicable"
    }
  ],
  equipmentId: "WasterGreatsword",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
