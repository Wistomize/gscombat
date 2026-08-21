import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed 7.0 coverage for Emberwell. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.emberwell.after-reaction.attack-percent"],
      id: "weapon.emberwell.after-reaction.attack-percent",
      label: "引火之源 · 触发元素反应后的攻击力",
      source: weaponSource("Emberwell"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.emberwell.after-stellar-reaction.reaction-damage-bonus"],
      id: "weapon.emberwell.after-stellar-reaction.reaction-damage-bonus",
      label: "引火之源 · 触发星烁反应后的反应伤害",
      source: weaponSource("Emberwell"),
      status: "implemented"
    }
  ],
  equipmentId: "Emberwell",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
