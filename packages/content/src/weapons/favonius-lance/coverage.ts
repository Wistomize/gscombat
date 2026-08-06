import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.favonius-lance.particles",
      label: "西风长枪 · 顺风而行",
      reason: "暴击产球影响循环充能，需要暴击事件、冷却、前后台和接球者模型。",
      source: weaponSource("FavoniusLance"),
      status: "not_applicable"
    }
  ],
  equipmentId: "FavoniusLance",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
