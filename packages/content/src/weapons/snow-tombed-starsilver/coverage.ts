import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.snow-tombed-starsilver.frost-icicle.physical-hit",
      label: "雪葬的星银 · 冷却就绪的霜葬物理伤害",
      source: {
        kind: "weapon",
        weaponId: "SnowTombedStarsilver"
      },
      status: "not_applicable",
      reason: "已确认忽略武器独立追加伤害，仅保留角色指标相关属性"
    }
  ],
  equipmentId: "SnowTombedStarsilver",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
