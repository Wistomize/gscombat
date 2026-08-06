import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.blackcliff-pole.defeated-enemy.1-stack.attack-percent",
        "weapon.blackcliff-pole.defeated-enemy.2-stack.attack-percent",
        "weapon.blackcliff-pole.defeated-enemy.3-stack.attack-percent"
      ],
      id: "weapon.blackcliff-pole.defeated-enemy.attack-percent",
      label: "黑岩刺枪 · 击败敌人后的攻击力层数",
      source: weaponSource("BlackcliffPole"),
      status: "implemented"
    }
  ],
  equipmentId: "BlackcliffPole",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
