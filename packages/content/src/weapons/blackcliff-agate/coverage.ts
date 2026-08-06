import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.blackcliff-agate.defeated-enemy.1-stack.attack-percent",
        "weapon.blackcliff-agate.defeated-enemy.2-stack.attack-percent",
        "weapon.blackcliff-agate.defeated-enemy.3-stack.attack-percent"
      ],
      id: "weapon.blackcliff-agate.defeated-enemy.attack-percent",
      label: "黑岩绯玉 · 击败敌人后的攻击力层数",
      source: weaponSource("BlackcliffAgate", "primary"),
      status: "implemented"
    }
  ],
  equipmentId: "BlackcliffAgate",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
