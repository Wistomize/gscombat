import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.mailed-flower.after-skill-hit-or-reaction.attack-percent",
        "weapon.mailed-flower.after-skill-hit-or-reaction.elemental-mastery"
      ],
      id: "weapon.mailed-flower.after-skill-hit-or-reaction.stats",
      label: "饰铁之花 · 风与花的密语",
      source: weaponSource("MailedFlower"),
      status: "implemented"
    }
  ],
  equipmentId: "MailedFlower",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
