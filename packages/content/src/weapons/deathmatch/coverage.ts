import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.deathmatch.single-target.attack",
        "weapon.deathmatch.multi-target.attack",
        "weapon.deathmatch.multi-target.defense"
      ],
      id: "weapon.deathmatch.attack",
      label: "决斗之枪 · 角斗士",
      source: weaponSource("Deathmatch"),
      status: "implemented"
    }
  ],
  equipmentId: "Deathmatch",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
