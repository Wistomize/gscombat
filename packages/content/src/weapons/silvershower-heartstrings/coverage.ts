import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.silvershower-heartstrings.bond.1-stack.hp-percent",
        "weapon.silvershower-heartstrings.bond.2-stack.hp-percent",
        "weapon.silvershower-heartstrings.bond.3-stack.hp-percent",
        "weapon.silvershower-heartstrings.bond.3-stack.burst-crit-rate"
      ],
      id: "weapon.silvershower-heartstrings.bond.stats",
      label: "白雨心弦 · 生命之契层数对应的生命值与三层元素爆发暴击率",
      source: weaponSource("SilvershowerHeartstrings"),
      status: "implemented"
    }
  ],
  equipmentId: "SilvershowerHeartstrings",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
