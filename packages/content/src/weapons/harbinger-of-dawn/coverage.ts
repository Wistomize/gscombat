import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.harbinger-of-dawn.hp-above-90.crit-rate"],
      id: "weapon.harbinger-of-dawn.hp-above-90.crit-rate",
      label: "黎明神剑 · 当前生命值高于90%",
      source: weaponSource("HarbingerOfDawn"),
      status: "implemented"
    }
  ],
  equipmentId: "HarbingerOfDawn",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
