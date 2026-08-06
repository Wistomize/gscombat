import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.debate-club.after-skill.physical-hit"],
      id: "weapon.debate-club.after-skill.physical-hit",
      label: "以理服人 · 元素战技后冷却就绪的普攻或重击物理伤害",
      source: weaponSource("DebateClub"),
      status: "implemented"
    }
  ],
  equipmentId: "DebateClub",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
