import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.sequence-of-solitude.hp-physical-hit",
      label: "冷寂迸音 · 冷却就绪的基于生命值上限的物理伤害",
      source: {
        kind: "weapon",
        weaponId: "SequenceOfSolitude"
      },
      status: "not_applicable",
      reason: "已确认忽略武器独立追加伤害，仅保留角色指标相关属性"
    }
  ],
  equipmentId: "SequenceOfSolitude",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
