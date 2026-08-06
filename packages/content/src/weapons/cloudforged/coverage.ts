import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.cloudforged.energy-reduced.1-stack.elemental-mastery",
        "weapon.cloudforged.energy-reduced.2-stack.elemental-mastery"
      ],
      id: "weapon.cloudforged.energy-reduced.elemental-mastery",
      label: "筑云 · 元素能量减少后的元素精通层数",
      source: weaponSource("Cloudforged"),
      status: "implemented"
    }
  ],
  equipmentId: "Cloudforged",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
