import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.royal-grimoire.focus.1-stack.crit-rate",
        "weapon.royal-grimoire.focus.2-stack.crit-rate",
        "weapon.royal-grimoire.focus.3-stack.crit-rate",
        "weapon.royal-grimoire.focus.4-stack.crit-rate",
        "weapon.royal-grimoire.focus.5-stack.crit-rate"
      ],
      id: "weapon.royal-grimoire.focus.crit-rate",
      label: "宗室秘法录 · 本次命中前的专注暴击率层数",
      source: weaponSource("RoyalGrimoire"),
      status: "implemented"
    }
  ],
  equipmentId: "RoyalGrimoire",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
