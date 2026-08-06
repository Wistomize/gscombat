import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.thrilling-tales-of-dragon-slayers.after-switch.party-attack-percent"],
      id: "weapon.thrilling-tales-of-dragon-slayers.after-switch.party-attack-percent",
      label: "讨龙英杰谭 · 从队友切换至当前角色后的攻击力",
      source: weaponSource("ThrillingTalesOfDragonSlayers", "party_member"),
      status: "implemented"
    }
  ],
  equipmentId: "ThrillingTalesOfDragonSlayers",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
