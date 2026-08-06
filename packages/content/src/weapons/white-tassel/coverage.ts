import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.white-tassel.normal-damage-bonus"],
      id: "weapon.white-tassel.normal-damage-bonus",
      label: "白缨枪 · 普通攻击伤害",
      source: weaponSource("WhiteTassel"),
      status: "implemented"
    }
  ],
  equipmentId: "WhiteTassel",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
