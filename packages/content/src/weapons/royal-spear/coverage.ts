import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.royal-spear.focus.1-stack.crit-rate",
        "weapon.royal-spear.focus.2-stack.crit-rate",
        "weapon.royal-spear.focus.3-stack.crit-rate",
        "weapon.royal-spear.focus.4-stack.crit-rate",
        "weapon.royal-spear.focus.5-stack.crit-rate"
      ],
      id: "weapon.royal-spear.focus.crit-rate",
      label: "宗室猎枪 · 本次命中前的专注暴击率层数",
      source: weaponSource("RoyalSpear"),
      status: "implemented"
    }
  ],
  equipmentId: "RoyalSpear",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
