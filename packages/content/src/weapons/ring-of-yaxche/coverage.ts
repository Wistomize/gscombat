import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.ring-of-yaxche.after-skill.final-hp-to-normal-damage-bonus"],
      id: "weapon.ring-of-yaxche.after-skill.hp-scaled-normal-damage-bonus",
      label: "木棉之环 · 元素战技后按生命值上限的普通攻击伤害",
      source: weaponSource("RingOfYaxche"),
      status: "implemented"
    }
  ],
  equipmentId: "RingOfYaxche",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
