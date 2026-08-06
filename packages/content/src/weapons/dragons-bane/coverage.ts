import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.dragons-bane.hydro-or-pyro-aura.damage-bonus"],
      id: "weapon.dragons-bane.hydro-or-pyro-aura.damage-bonus",
      label: "匣里灭辰 · 当前目标受水元素或火元素影响",
      source: weaponSource("DragonsBane"),
      status: "implemented"
    }
  ],
  equipmentId: "DragonsBane",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
