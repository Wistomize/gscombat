import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.raven-bow.hydro-or-pyro-aura.damage-bonus",
        "weapon.raven-bow.hydro-or-pyro-aura.damage-bonus.disabled"
      ],
      id: "weapon.raven-bow.hydro-or-pyro-aura.damage-bonus",
      label: "鸦羽弓 · 当前目标受水元素或火元素影响",
      source: {
        kind: "weapon",
        weaponId: "RavenBow"
      },
      status: "implemented"
    }
  ],
  equipmentId: "RavenBow",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
