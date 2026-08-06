import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.favonius-codex.particles",
      label: "西风秘典 · 顺风而行",
      reason: "暴击产球影响循环充能，需要暴击事件、冷却、前后台和接球者模型。",
      source: weaponSource("FavoniusCodex"),
      status: "not_applicable"
    }
  ],
  equipmentId: "FavoniusCodex",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
