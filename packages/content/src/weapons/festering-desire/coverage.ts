import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.festering-desire.skill-damage-bonus"],
      id: "weapon.festering-desire.skill-damage-bonus",
      label: "腐殖之剑 · 元素战技伤害",
      source: weaponSource("FesteringDesire"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.festering-desire.skill-crit-rate"],
      id: "weapon.festering-desire.skill-crit-rate",
      label: "腐殖之剑 · 元素战技暴击率",
      source: weaponSource("FesteringDesire"),
      status: "implemented"
    }
  ],
  equipmentId: "FesteringDesire",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
