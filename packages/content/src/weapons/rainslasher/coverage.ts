import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.rainslasher.hydro-or-electro-aura.damage-bonus",
        "weapon.rainslasher.hydro-or-electro-aura.damage-bonus.disabled"
      ],
      id: "weapon.rainslasher.hydro-or-electro-aura.damage-bonus",
      label: "雨裁 · 当前目标受水元素或雷元素影响",
      source: {
        kind: "weapon",
        weaponId: "Rainslasher"
      },
      status: "implemented"
    }
  ],
  equipmentId: "Rainslasher",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
