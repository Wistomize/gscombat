import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.primordial-jade-winged-spear.eagle-spear.7-stack.attack-percent",
        "weapon.primordial-jade-winged-spear.eagle-spear.7-stack.damage-bonus"
      ],
      id: "weapon.primordial-jade-winged-spear.eagle-spear.stats",
      label: "和璞鸢 · 鹰之傲层数对应的攻击力与七层全伤害",
      source: {
        kind: "weapon",
        weaponId: "PrimordialJadeWingedSpear"
      },
      status: "implemented"
    }
  ],
  equipmentId: "PrimordialJadeWingedSpear",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
