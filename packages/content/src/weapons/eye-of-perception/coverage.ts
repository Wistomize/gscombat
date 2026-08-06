import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.eye-of-perception.initial-projectile.physical-hit"],
      id: "weapon.eye-of-perception.initial-projectile.physical-hit",
      label: "昭心 · 冷却就绪的首发法球物理伤害",
      source: weaponSource("EyeOfPerception"),
      status: "implemented"
    },
    {
      id: "weapon.eye-of-perception.projectile-bounces",
      label: "昭心 · 法球在敌人间弹射的后续命中",
      reason: "后续法球弹射属于武器自主伤害，不计入角色当前核心动作伤害。",
      source: weaponSource("EyeOfPerception"),
      status: "not_applicable"
    }
  ],
  equipmentId: "EyeOfPerception",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
