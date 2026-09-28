import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.whiteblind.infusion-blade.4-stack.attack-percent",
        "weapon.whiteblind.infusion-blade.4-stack.defense-percent"
      ],
      id: "weapon.whiteblind.infusion-blade.attack-and-defense-percent",
      label: "白影剑 · 注能之锋层数对应的攻击力与防御力",
      source: {
        kind: "weapon",
        weaponId: "Whiteblind"
      },
      status: "implemented"
    }
  ],
  equipmentId: "Whiteblind",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
