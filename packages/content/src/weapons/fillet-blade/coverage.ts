import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.fillet-blade.cooldown-ready.expected-physical-hit",
      label: "吃虎鱼刀 · 当前攻击命中且冷却就绪时的决物理伤害期望",
      source: {
        kind: "weapon",
        weaponId: "FilletBlade"
      },
      status: "not_applicable",
      reason: "已确认忽略武器独立追加伤害，仅保留角色指标相关属性"
    }
  ],
  equipmentId: "FilletBlade",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
