import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.the-flute.five-harmonic.physical-hit",
      label: "笛剑 · 五个和音后的冷却就绪物理伤害",
      source: {
        kind: "weapon",
        weaponId: "TheFlute"
      },
      status: "not_applicable",
      reason: "已确认忽略武器独立追加伤害，仅保留角色指标相关属性"
    }
  ],
  equipmentId: "TheFlute",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
