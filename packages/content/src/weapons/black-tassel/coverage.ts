import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.black-tassel.slime-target.damage-bonus"],
      id: "weapon.black-tassel.slime-target.damage-bonus",
      label: "黑缨枪 · 当前目标为史莱姆类敌人时的伤害",
      source: weaponSource("BlackTassel"),
      status: "implemented"
    }
  ],
  equipmentId: "BlackTassel",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
