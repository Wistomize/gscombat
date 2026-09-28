import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.eye-of-perception.initial-projectile.physical-hit",
      label: "昭心 · 冷却就绪的首发法球物理伤害",
      source: {
        kind: "weapon",
        weaponId: "EyeOfPerception"
      },
      status: "not_applicable",
      reason: "已确认忽略武器独立追加伤害，仅保留角色指标相关属性"
    },
    {
      id: "weapon.eye-of-perception.projectile-bounces",
      label: "昭心 · 法球在敌人间弹射的后续命中",
      reason: "后续法球弹射属于武器自主伤害，不计入角色当前核心动作伤害。",
      source: {
        kind: "weapon",
        weaponId: "EyeOfPerception"
      },
      status: "not_applicable"
    }
  ],
  equipmentId: "EyeOfPerception",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
