import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.the-flute.five-harmonic.physical-hit"],
      id: "weapon.the-flute.five-harmonic.physical-hit",
      label: "笛剑 · 五个和音后的冷却就绪物理伤害",
      source: weaponSource("TheFlute"),
      status: "implemented"
    }
  ],
  equipmentId: "TheFlute",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
