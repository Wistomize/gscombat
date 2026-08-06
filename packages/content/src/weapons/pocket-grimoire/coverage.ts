import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.pocket-grimoire.no-passive",
      label: "口袋魔导书 · 无武器技能",
      reason: "该武器没有被动效果；基础面板仍由装备数据处理。",
      source: weaponSource("PocketGrimoire"),
      status: "not_applicable"
    }
  ],
  equipmentId: "PocketGrimoire",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
