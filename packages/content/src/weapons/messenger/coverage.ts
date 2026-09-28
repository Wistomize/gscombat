import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.messenger.weak-point-guaranteed-crit.additional-damage",
      label: "信使 · 瞄准射击命中要害且冷却就绪时的必定暴击物理附加伤害",
      source: {
        kind: "weapon",
        weaponId: "Messenger"
      },
      status: "not_applicable",
      reason: "已确认忽略武器独立追加伤害，仅保留角色指标相关属性"
    }
  ],
  equipmentId: "Messenger",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
