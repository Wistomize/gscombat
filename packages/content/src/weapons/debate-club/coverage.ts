import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.debate-club.after-skill.physical-hit",
      label: "以理服人 · 元素战技后冷却就绪的普攻或重击物理伤害",
      source: {
        kind: "weapon",
        weaponId: "DebateClub"
      },
      status: "not_applicable",
      reason: "已确认忽略武器独立追加伤害，仅保留角色指标相关属性"
    }
  ],
  equipmentId: "DebateClub",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
