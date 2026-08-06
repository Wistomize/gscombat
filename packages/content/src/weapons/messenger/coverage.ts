import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.messenger.weak-point-guaranteed-crit.additional-damage"],
      id: "weapon.messenger.weak-point-guaranteed-crit.additional-damage",
      label: "信使 · 瞄准射击命中要害且冷却就绪时的必定暴击物理附加伤害",
      source: weaponSource("Messenger"),
      status: "implemented"
    }
  ],
  equipmentId: "Messenger",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
