import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.akuoumaru.burst-damage-bonus"],
      id: "weapon.akuoumaru.burst-damage-bonus",
      label: "恶王丸 · 全队元素爆发能量上限（元素爆发伤害）",
      source: weaponSource("Akuoumaru"),
      status: "implemented"
    }
  ],
  equipmentId: "Akuoumaru",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
