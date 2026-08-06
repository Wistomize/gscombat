import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.snare-hook.after-reaction.elemental-mastery",
        "weapon.snare-hook.after-reaction.full-moon.elemental-mastery"
      ],
      id: "weapon.snare-hook.after-reaction.elemental-mastery",
      label: "罗网勾针 · 触发元素反应后的元素精通与月兆·满辉分支",
      source: weaponSource("SnareHook"),
      status: "implemented"
    }
  ],
  equipmentId: "SnareHook",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
