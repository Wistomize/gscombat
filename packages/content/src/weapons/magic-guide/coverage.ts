import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.magic-guide.hydro-or-electro-aura.damage-bonus",
        "weapon.magic-guide.hydro-or-electro-aura.damage-bonus.disabled"
      ],
      id: "weapon.magic-guide.hydro-or-electro-aura.damage-bonus",
      label: "魔导绪论 · 当前目标受水元素或雷元素影响",
      source: {
        kind: "weapon",
        weaponId: "MagicGuide"
      },
      status: "implemented"
    }
  ],
  equipmentId: "MagicGuide",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
