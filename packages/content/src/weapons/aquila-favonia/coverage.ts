import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.aquila-favonia.attack"],
      id: "weapon.aquila-favonia.attack",
      label: "风鹰剑 · 西风之鹰的抗争",
      source: weaponSource("AquilaFavonia"),
      status: "implemented"
    },
    {
      id: "weapon.aquila-favonia.retaliation",
      label: "风鹰剑 · 西风之鹰的抗争（受击反击）",
      reason: "需要受击事件、冷却和独立物理伤害段；不属于当前角色核心动作的一次命中。",
      source: weaponSource("AquilaFavonia"),
      status: "not_applicable"
    }
  ],
  equipmentId: "AquilaFavonia",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
