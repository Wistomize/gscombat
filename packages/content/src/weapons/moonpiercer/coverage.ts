import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.moonpiercer.after-dendro-reaction.leaf-picked.attack-percent"],
      id: "weapon.moonpiercer.after-dendro-reaction.leaf-picked.attack-percent",
      label: "贯月矢 · 拾取苏生之叶后",
      source: weaponSource("Moonpiercer"),
      status: "implemented"
    }
  ],
  equipmentId: "Moonpiercer",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
