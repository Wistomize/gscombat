import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.blackcliff-longsword.defeated-enemy.1-stack.attack-percent",
        "weapon.blackcliff-longsword.defeated-enemy.2-stack.attack-percent",
        "weapon.blackcliff-longsword.defeated-enemy.3-stack.attack-percent"
      ],
      id: "weapon.blackcliff-longsword.defeated-enemy.attack-percent",
      label: "黑岩长剑 · 击败敌人后的攻击力层数",
      source: weaponSource("BlackcliffLongsword"),
      status: "implemented"
    }
  ],
  equipmentId: "BlackcliffLongsword",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
