import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.the-stringless.skill-burst-damage-bonus"],
      id: "weapon.the-stringless.skill-burst-damage-bonus",
      label: "绝弦 · 元素战技与元素爆发伤害",
      source: weaponSource("TheStringless"),
      status: "implemented"
    }
  ],
  equipmentId: "TheStringless",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
