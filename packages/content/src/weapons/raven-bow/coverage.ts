import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.raven-bow.hydro-or-pyro-aura.damage-bonus"],
      id: "weapon.raven-bow.hydro-or-pyro-aura.damage-bonus",
      label: "鸦羽弓 · 当前目标受水元素或火元素影响",
      source: weaponSource("RavenBow"),
      status: "implemented"
    }
  ],
  equipmentId: "RavenBow",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
