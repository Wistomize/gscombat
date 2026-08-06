import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.flute-of-ezpitzal.after-skill.defense-percent"],
      id: "weapon.flute-of-ezpitzal.after-skill.defense-percent",
      label: "息燧之笛 · 施放元素战技后",
      source: weaponSource("FluteOfEzpitzal"),
      status: "implemented"
    }
  ],
  equipmentId: "FluteOfEzpitzal",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
