import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.the-bell.shielded.damage-bonus"],
      id: "weapon.the-bell.shielded.damage-bonus",
      label: "钟剑 · 处于护盾庇护下的全伤害",
      source: weaponSource("TheBell"),
      status: "implemented"
    },
    {
      id: "weapon.the-bell.rebellious-guardian-shield",
      label: "钟剑 · 叛逆的守护者护盾与护盾强效",
      reason: "护盾生成与护盾强效不进入角色对敌核心动作伤害；护盾状态下的全伤害效果仍单独维护。",
      source: weaponSource("TheBell"),
      status: "not_applicable"
    }
  ],
  equipmentId: "TheBell",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
