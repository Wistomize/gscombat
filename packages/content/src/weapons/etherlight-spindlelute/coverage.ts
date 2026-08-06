import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.etherlight-spindlelute.after-skill.elemental-mastery"],
      id: "weapon.etherlight-spindlelute.after-skill.elemental-mastery",
      label: "天光的纺琴 · 施放元素战技后",
      source: weaponSource("EtherlightSpindlelute"),
      status: "implemented"
    }
  ],
  equipmentId: "EtherlightSpindlelute",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
