import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.moonweavers-dawn.burst-damage-bonus",
        "weapon.moonweavers-dawn.at-most-sixty-energy.extra-burst-damage-bonus",
        "weapon.moonweavers-dawn.at-most-forty-energy.extra-burst-damage-bonus"
      ],
      id: "weapon.moonweavers-dawn.burst-damage-bonus",
      label: "织月者的曙色 · 元素爆发伤害与元素能量上限分支",
      source: weaponSource("MoonweaversDawn"),
      status: "implemented"
    }
  ],
  equipmentId: "MoonweaversDawn",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
