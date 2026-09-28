import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  comparison: {
    excluded: true
  },
  clauses: [
    {
      id: "weapon.sword-of-descension.descension.physical-hit",
      label: "降临之剑 · 冷却就绪时的降临物理伤害",
      source: {
        kind: "weapon",
        weaponId: "SwordOfDescension"
      },
      status: "not_applicable",
      reason: "已确认忽略武器独立追加伤害，仅保留角色指标相关属性"
    },
    {
      effectIds: [
        "weapon.sword-of-descension.playstation.traveler.flat-attack"
      ],
      id: "weapon.sword-of-descension.platform-eligibility",
      label: "降临之剑 · PlayStation Network 被动已生效快照",
      source: {
        kind: "weapon",
        weaponId: "SwordOfDescension"
      },
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.sword-of-descension.playstation.traveler.flat-attack"
      ],
      id: "weapon.sword-of-descension.traveler-flat-attack",
      label: "降临之剑 · 旅行者装备时的固定攻击力",
      source: {
        kind: "weapon",
        weaponId: "SwordOfDescension"
      },
      status: "implemented"
    }
  ],
  equipmentId: "SwordOfDescension",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
