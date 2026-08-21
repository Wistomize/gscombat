import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed 7.0 coverage for Blade of Atonement. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.blade-of-atonement.after-reaction.elemental-mastery"],
      id: "weapon.blade-of-atonement.after-reaction.elemental-mastery",
      label: "救赎之斩 · 触发元素反应后的元素精通",
      source: weaponSource("BladeOfAtonement"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.blade-of-atonement.after-stellar-reaction.attack-percent"],
      id: "weapon.blade-of-atonement.after-stellar-reaction.attack-percent",
      label: "救赎之斩 · 触发星烁反应后的攻击力",
      source: weaponSource("BladeOfAtonement"),
      status: "implemented"
    }
  ],
  equipmentId: "BladeOfAtonement",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
