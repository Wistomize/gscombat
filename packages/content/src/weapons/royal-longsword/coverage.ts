import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.royal-longsword.focus.1-stack.crit-rate",
        "weapon.royal-longsword.focus.2-stack.crit-rate",
        "weapon.royal-longsword.focus.3-stack.crit-rate",
        "weapon.royal-longsword.focus.4-stack.crit-rate",
        "weapon.royal-longsword.focus.5-stack.crit-rate"
      ],
      id: "weapon.royal-longsword.focus.crit-rate",
      label: "宗室长剑 · 本次命中前的专注暴击率层数",
      source: weaponSource("RoyalLongsword"),
      status: "implemented"
    }
  ],
  equipmentId: "RoyalLongsword",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
