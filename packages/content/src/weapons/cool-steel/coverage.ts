import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.cool-steel.hydro-or-cryo-aura.damage-bonus",
        "weapon.cool-steel.hydro-or-cryo-aura.damage-bonus.disabled"
      ],
      id: "weapon.cool-steel.hydro-or-cryo-aura.damage-bonus",
      label: "冷刃 · 当前目标受水元素或冰元素影响时的伤害",
      source: {
        kind: "weapon",
        weaponId: "CoolSteel"
      },
      status: "implemented"
    }
  ],
  equipmentId: "CoolSteel",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
