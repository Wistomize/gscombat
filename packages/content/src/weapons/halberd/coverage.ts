import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.halberd.cooldown-ready.physical-hit"],
      id: "weapon.halberd.cooldown-ready.physical-hit",
      label: "钺矛 · 冷却就绪时本次普攻触发沉重物理伤害",
      source: weaponSource("Halberd"),
      status: "implemented"
    }
  ],
  equipmentId: "Halberd",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
