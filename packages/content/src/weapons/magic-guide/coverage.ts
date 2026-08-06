import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.magic-guide.hydro-or-electro-aura.damage-bonus"],
      id: "weapon.magic-guide.hydro-or-electro-aura.damage-bonus",
      label: "魔导绪论 · 当前目标受水元素或雷元素影响",
      source: weaponSource("MagicGuide"),
      status: "implemented"
    }
  ],
  equipmentId: "MagicGuide",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
