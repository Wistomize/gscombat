import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.primordial-jade-winged-spear.eagle-spear.1-stack.attack-percent",
        "weapon.primordial-jade-winged-spear.eagle-spear.2-stack.attack-percent",
        "weapon.primordial-jade-winged-spear.eagle-spear.3-stack.attack-percent",
        "weapon.primordial-jade-winged-spear.eagle-spear.4-stack.attack-percent",
        "weapon.primordial-jade-winged-spear.eagle-spear.5-stack.attack-percent",
        "weapon.primordial-jade-winged-spear.eagle-spear.6-stack.attack-percent",
        "weapon.primordial-jade-winged-spear.eagle-spear.7-stack.attack-percent",
        "weapon.primordial-jade-winged-spear.eagle-spear.7-stack.damage-bonus"
      ],
      id: "weapon.primordial-jade-winged-spear.eagle-spear.stats",
      label: "和璞鸢 · 鹰之傲层数对应的攻击力与七层全伤害",
      source: weaponSource("PrimordialJadeWingedSpear"),
      status: "implemented"
    }
  ],
  equipmentId: "PrimordialJadeWingedSpear",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
