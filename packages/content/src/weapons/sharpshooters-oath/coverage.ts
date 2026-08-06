import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.sharpshooters-oath.current-weak-point-hit.damage-bonus"],
      id: "weapon.sharpshooters-oath.current-weak-point-hit.damage-bonus",
      label: "神射手之誓 · 本次命中敌人要害时的伤害",
      source: weaponSource("SharpshootersOath"),
      status: "implemented"
    }
  ],
  equipmentId: "SharpshootersOath",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
