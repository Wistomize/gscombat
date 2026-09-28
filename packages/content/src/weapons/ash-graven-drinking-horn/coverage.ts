import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.ash-graven-drinking-horn.hp-physical-hit",
      label: "苍纹角杯 · 攻击命中的基于生命值上限的额外物理伤害",
      source: {
        kind: "weapon",
        weaponId: "AshGravenDrinkingHorn"
      },
      status: "not_applicable",
      reason: "已确认忽略武器独立追加伤害，仅保留角色指标相关属性"
    }
  ],
  equipmentId: "AshGravenDrinkingHorn",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
