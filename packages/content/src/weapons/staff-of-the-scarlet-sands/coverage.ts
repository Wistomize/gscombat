import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.staff-of-the-scarlet-sands.elemental-mastery-to-flat-attack",
        "weapon.staff-of-the-scarlet-sands.red-sands-dream.1-stack.elemental-mastery-to-flat-attack",
        "weapon.staff-of-the-scarlet-sands.red-sands-dream.2-stack.elemental-mastery-to-flat-attack",
        "weapon.staff-of-the-scarlet-sands.red-sands-dream.3-stack.elemental-mastery-to-flat-attack"
      ],
      id: "weapon.staff-of-the-scarlet-sands.elemental-mastery-sourced-flat-attack",
      label: "赤沙之杖 · 元素精通转平面攻击力与元素战技命中后的赤沙之梦层数",
      source: weaponSource("StaffOfTheScarletSands"),
      status: "implemented"
    }
  ],
  equipmentId: "StaffOfTheScarletSands",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
