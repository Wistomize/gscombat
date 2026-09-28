import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.luxurious-sea-lord.burst-damage-bonus"
      ],
      id: "weapon.luxurious-sea-lord.burst-damage-bonus",
      label: "衔珠海皇 · 元素爆发伤害",
      source: {
        kind: "weapon",
        weaponId: "LuxuriousSeaLord"
      },
      status: "implemented"
    },
    {
      id: "weapon.luxurious-sea-lord.tuna-impact",
      label: "衔珠海皇 · 大鲔冲击（本次元素爆发命中且15秒冷却已就绪）",
      source: {
        kind: "weapon",
        weaponId: "LuxuriousSeaLord"
      },
      status: "not_applicable",
      reason: "已确认忽略武器独立追加伤害，仅保留角色指标相关属性"
    }
  ],
  equipmentId: "LuxuriousSeaLord",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
