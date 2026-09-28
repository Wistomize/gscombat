import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.dragonspine-spear.frost-icicle.physical-hit",
      label: "龙脊长枪 · 冷却就绪的霜葬物理伤害",
      source: {
        kind: "weapon",
        weaponId: "DragonspineSpear"
      },
      status: "not_applicable",
      reason: "已确认忽略武器独立追加伤害，仅保留角色指标相关属性"
    }
  ],
  equipmentId: "DragonspineSpear",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
