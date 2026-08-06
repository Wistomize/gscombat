import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.blackcliff-slasher.defeated-enemy.1-stack.attack-percent",
        "weapon.blackcliff-slasher.defeated-enemy.2-stack.attack-percent",
        "weapon.blackcliff-slasher.defeated-enemy.3-stack.attack-percent"
      ],
      id: "weapon.blackcliff-slasher.defeated-enemy.attack-percent",
      label: "黑岩斩刀 · 击败敌人后的攻击力层数",
      source: weaponSource("BlackcliffSlasher"),
      status: "implemented"
    }
  ],
  equipmentId: "BlackcliffSlasher",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
