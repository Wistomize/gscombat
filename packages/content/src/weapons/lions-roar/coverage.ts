import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.lions-roar.pyro-or-electro-aura.damage-bonus"],
      id: "weapon.lions-roar.pyro-or-electro-aura.damage-bonus",
      label: "匣里龙吟 · 当前目标受火元素或雷元素影响",
      source: weaponSource("LionsRoar"),
      status: "implemented"
    }
  ],
  equipmentId: "LionsRoar",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
