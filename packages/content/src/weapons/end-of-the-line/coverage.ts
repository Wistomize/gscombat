import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.end-of-the-line.flowrider.physical-hit",
      label: "竭泽 · 沿洄状态下可触发的物理伤害",
      source: {
        kind: "weapon",
        weaponId: "EndOfTheLine"
      },
      status: "not_applicable",
      reason: "已确认忽略武器独立追加伤害，仅保留角色指标相关属性"
    }
  ],
  equipmentId: "EndOfTheLine",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
