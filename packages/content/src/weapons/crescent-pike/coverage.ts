import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.crescent-pike.after-particle.additional-physical-damage",
      label: "流月针 · 获得元素微粒或晶球后的普通攻击、重击额外物理伤害",
      source: {
        kind: "weapon",
        weaponId: "CrescentPike"
      },
      status: "not_applicable",
      reason: "已确认忽略武器独立追加伤害，仅保留角色指标相关属性"
    }
  ],
  equipmentId: "CrescentPike",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
