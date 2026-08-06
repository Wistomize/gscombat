import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.frostbearer.frost-icicle.without-cryo-aura.physical-hit",
        "weapon.frostbearer.frost-icicle.with-cryo-aura.physical-hit"
      ],
      id: "weapon.frostbearer.frost-icicle.physical-hit",
      label: "忍冬之果 · 冷却就绪的霜葬物理伤害",
      source: weaponSource("Frostbearer"),
      status: "implemented"
    }
  ],
  equipmentId: "Frostbearer",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
