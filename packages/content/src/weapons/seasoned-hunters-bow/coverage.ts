import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.seasoned-hunters-bow.no-passive",
      label: "历练的猎弓 · 无武器技能",
      reason: "该武器没有被动效果；基础面板仍由装备数据处理。",
      source: weaponSource("SeasonedHuntersBow"),
      status: "not_applicable"
    }
  ],
  equipmentId: "SeasonedHuntersBow",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
