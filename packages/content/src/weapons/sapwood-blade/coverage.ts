import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.sapwood-blade.after-dendro-reaction.leaf-picked.elemental-mastery"],
      id: "weapon.sapwood-blade.after-dendro-reaction.leaf-picked.elemental-mastery",
      label: "原木刀 · 拾取种识之叶后的元素精通",
      source: weaponSource("SapwoodBlade"),
      status: "implemented"
    }
  ],
  equipmentId: "SapwoodBlade",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
