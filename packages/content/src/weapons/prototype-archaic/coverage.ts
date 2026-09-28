import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.prototype-archaic.physical-hit",
      label: "试作古华 · 普通攻击或重击命中的额外物理伤害",
      source: {
        kind: "weapon",
        weaponId: "PrototypeArchaic"
      },
      status: "not_applicable",
      reason: "已确认忽略武器独立追加伤害，仅保留角色指标相关属性"
    }
  ],
  equipmentId: "PrototypeArchaic",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
