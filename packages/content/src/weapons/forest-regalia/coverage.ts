import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.forest-regalia.after-dendro-reaction.leaf-picked.elemental-mastery"],
      id: "weapon.forest-regalia.after-dendro-reaction.leaf-picked.elemental-mastery",
      label: "森林王器 · 拾取种识之叶后",
      source: weaponSource("ForestRegalia"),
      status: "implemented"
    }
  ],
  equipmentId: "ForestRegalia",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
