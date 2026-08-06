import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.sacrificers-staff.sacrificial-rite.1-stack.attack-percent",
        "weapon.sacrificers-staff.sacrificial-rite.1-stack.energy-recharge",
        "weapon.sacrificers-staff.sacrificial-rite.2-stack.attack-percent",
        "weapon.sacrificers-staff.sacrificial-rite.2-stack.energy-recharge",
        "weapon.sacrificers-staff.sacrificial-rite.3-stack.attack-percent",
        "weapon.sacrificers-staff.sacrificial-rite.3-stack.energy-recharge"
      ],
      id: "weapon.sacrificers-staff.sacrificial-rite.stats",
      label: "圣祭者的辉杖 · 元素战技命中后层数对应的攻击力与元素充能效率",
      source: weaponSource("SacrificersStaff"),
      status: "implemented"
    }
  ],
  equipmentId: "SacrificersStaff",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
