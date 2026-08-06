import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.royal-bow.focus.1-stack.crit-rate",
        "weapon.royal-bow.focus.2-stack.crit-rate",
        "weapon.royal-bow.focus.3-stack.crit-rate",
        "weapon.royal-bow.focus.4-stack.crit-rate",
        "weapon.royal-bow.focus.5-stack.crit-rate"
      ],
      id: "weapon.royal-bow.focus.crit-rate",
      label: "宗室长弓 · 本次命中前的专注暴击率层数",
      source: weaponSource("RoyalBow"),
      status: "implemented"
    }
  ],
  equipmentId: "RoyalBow",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
