import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.favonius-warbow.particles",
      label: "西风猎弓 · 顺风而行",
      reason: "暴击产球影响循环充能，需要暴击事件、冷却、前后台和接球者模型。",
      source: weaponSource("FavoniusWarbow"),
      status: "not_applicable"
    }
  ],
  equipmentId: "FavoniusWarbow",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
