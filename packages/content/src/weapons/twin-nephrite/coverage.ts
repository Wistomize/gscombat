import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.twin-nephrite.after-defeat.attack-percent",
        "weapon.twin-nephrite.after-defeat.attack-percent.disabled"
      ],
      id: "weapon.twin-nephrite.after-defeat.attack-percent",
      label: "甲级宝珏 · 击败敌人后的攻击力",
      source: {
        kind: "weapon",
        weaponId: "TwinNephrite"
      },
      status: "implemented"
    },
    {
      id: "weapon.twin-nephrite.after-defeat.movement-speed",
      label: "甲级宝珏 · 击败敌人后的移动速度",
      reason: "移动速度只影响位移与循环，不改变当前核心动作的一次期望数值。",
      source: {
        kind: "weapon",
        weaponId: "TwinNephrite"
      },
      status: "not_applicable"
    }
  ],
  equipmentId: "TwinNephrite",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
