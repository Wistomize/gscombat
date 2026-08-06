import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.rainslasher.hydro-or-electro-aura.damage-bonus"],
      id: "weapon.rainslasher.hydro-or-electro-aura.damage-bonus",
      label: "雨裁 · 当前目标受水元素或雷元素影响",
      source: weaponSource("Rainslasher"),
      status: "implemented"
    }
  ],
  equipmentId: "Rainslasher",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
