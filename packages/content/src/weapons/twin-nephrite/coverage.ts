import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.twin-nephrite.after-defeat.attack-percent"],
      id: "weapon.twin-nephrite.after-defeat.attack-percent",
      label: "甲级宝珏 · 击败敌人后的攻击力",
      source: weaponSource("TwinNephrite"),
      status: "implemented"
    },
    {
      id: "weapon.twin-nephrite.after-defeat.movement-speed",
      label: "甲级宝珏 · 击败敌人后的移动速度",
      reason: "移动速度只影响位移与循环，不改变当前核心动作的一次期望数值。",
      source: weaponSource("TwinNephrite"),
      status: "not_applicable"
    }
  ],
  equipmentId: "TwinNephrite",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
