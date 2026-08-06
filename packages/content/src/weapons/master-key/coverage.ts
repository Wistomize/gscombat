import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.master-key.after-reaction.elemental-mastery",
        "weapon.master-key.after-reaction.full-moon.elemental-mastery"
      ],
      id: "weapon.master-key.after-reaction.elemental-mastery",
      label: "万能钥匙 · 触发元素反应后的元素精通与月兆·满辉分支",
      source: weaponSource("MasterKey"),
      status: "implemented"
    }
  ],
  equipmentId: "MasterKey",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
