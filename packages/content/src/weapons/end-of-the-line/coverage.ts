import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.end-of-the-line.flowrider.physical-hit"],
      id: "weapon.end-of-the-line.flowrider.physical-hit",
      label: "竭泽 · 沿洄状态下可触发的物理伤害",
      source: weaponSource("EndOfTheLine"),
      status: "implemented"
    }
  ],
  equipmentId: "EndOfTheLine",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
