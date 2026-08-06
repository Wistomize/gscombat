import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.the-viridescent-hunt.verdant-wind.autonomous-periodic-damage",
      label: "苍翠猎弓 · 苍翠之风的持续吸附物理伤害",
      reason: "苍翠之风属于武器周期自主伤害，不计入角色当前核心动作伤害。",
      source: weaponSource("TheViridescentHunt"),
      status: "not_applicable"
    }
  ],
  equipmentId: "TheViridescentHunt",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
