import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.toukabou-shigure.cursed-parasol-target.damage-bonus"],
      id: "weapon.toukabou-shigure.cursed-parasol-target.damage-bonus",
      label: "东花坊时雨 · 当前目标处于纸伞作祟状态",
      source: weaponSource("ToukabouShigure"),
      status: "implemented"
    }
  ],
  equipmentId: "ToukabouShigure",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
