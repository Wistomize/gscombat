import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.mouuns-moon.burst-damage-bonus"],
      id: "weapon.mouuns-moon.burst-damage-bonus",
      label: "曚云之月 · 全队元素能量上限",
      source: weaponSource("MouunsMoon"),
      status: "implemented"
    }
  ],
  equipmentId: "MouunsMoon",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
