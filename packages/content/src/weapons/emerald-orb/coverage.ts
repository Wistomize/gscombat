import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.emerald-orb.after-hydro-reaction.attack-percent"],
      id: "weapon.emerald-orb.after-hydro-reaction.attack-percent",
      label: "翡玉法球 · 触发指定水元素相关反应后",
      source: weaponSource("EmeraldOrb"),
      status: "implemented"
    }
  ],
  equipmentId: "EmeraldOrb",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
