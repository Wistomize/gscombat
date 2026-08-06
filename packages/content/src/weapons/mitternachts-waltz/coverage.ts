import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.mitternachts-waltz.after-normal-hit.skill-damage-bonus",
        "weapon.mitternachts-waltz.after-skill-hit.normal-damage-bonus"
      ],
      id: "weapon.mitternachts-waltz.passive",
      label: "幽夜华尔兹 · 极夜二重奏",
      source: weaponSource("MitternachtsWaltz"),
      status: "implemented"
    }
  ],
  equipmentId: "MitternachtsWaltz",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
