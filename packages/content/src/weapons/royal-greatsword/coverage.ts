import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.royal-greatsword.focus.1-stack.crit-rate",
        "weapon.royal-greatsword.focus.2-stack.crit-rate",
        "weapon.royal-greatsword.focus.3-stack.crit-rate",
        "weapon.royal-greatsword.focus.4-stack.crit-rate",
        "weapon.royal-greatsword.focus.5-stack.crit-rate"
      ],
      id: "weapon.royal-greatsword.focus.crit-rate",
      label: "宗室大剑 · 本次命中前的专注暴击率层数",
      source: weaponSource("RoyalGreatsword"),
      status: "implemented"
    }
  ],
  equipmentId: "RoyalGreatsword",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
