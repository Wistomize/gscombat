import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.dragons-bane.hydro-or-pyro-aura.damage-bonus",
        "weapon.dragons-bane.hydro-or-pyro-aura.damage-bonus.disabled"
      ],
      id: "weapon.dragons-bane.hydro-or-pyro-aura.damage-bonus",
      label: "匣里灭辰 · 当前目标受水元素或火元素影响",
      source: {
        kind: "weapon",
        weaponId: "DragonsBane"
      },
      status: "implemented"
    }
  ],
  equipmentId: "DragonsBane",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
