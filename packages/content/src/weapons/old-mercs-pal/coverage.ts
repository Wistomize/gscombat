import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.old-mercs-pal.no-passive",
      label: "佣兵重剑 · 无武器技能",
      reason: "该武器没有被动效果；基础面板仍由装备数据处理。",
      source: weaponSource("OldMercsPal"),
      status: "not_applicable"
    }
  ],
  equipmentId: "OldMercsPal",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
