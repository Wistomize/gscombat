import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.skyward-pride.damage-bonus"
      ],
      id: "weapon.skyward-pride.damage-bonus",
      label: "天空之傲 · 造成的伤害",
      source: {
        kind: "weapon",
        weaponId: "SkywardPride"
      },
      status: "implemented"
    },
    {
      id: "weapon.skyward-pride.vacuum-blade",
      label: "天空之傲 · 真空刃（元素爆发后，本次命中可触发）",
      source: {
        kind: "weapon",
        weaponId: "SkywardPride"
      },
      status: "not_applicable",
      reason: "已确认忽略武器独立追加伤害，仅保留角色指标相关属性"
    }
  ],
  equipmentId: "SkywardPride",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
