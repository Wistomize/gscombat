import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.halberd.cooldown-ready.physical-hit",
      label: "钺矛 · 冷却就绪时本次普攻触发沉重物理伤害",
      source: {
        kind: "weapon",
        weaponId: "Halberd"
      },
      status: "not_applicable",
      reason: "已确认忽略武器独立追加伤害，仅保留角色指标相关属性"
    }
  ],
  equipmentId: "Halberd",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
