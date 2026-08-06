import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.hakushin-ring.overloaded-related-element-damage-bonus",
        "weapon.hakushin-ring.superconduct-related-element-damage-bonus",
        "weapon.hakushin-ring.electro-charged-related-element-damage-bonus",
        "weapon.hakushin-ring.swirl-related-element-damage-bonus",
        "weapon.hakushin-ring.crystallize-related-element-damage-bonus",
        "weapon.hakushin-ring.aggravate-related-element-damage-bonus"
      ],
      id: "weapon.hakushin-ring.electro-reaction.related-element-damage-bonus",
      label: "白辰之环 · 触发雷元素相关反应后的关联元素伤害",
      source: weaponSource("HakushinRing"),
      status: "implemented"
    }
  ],
  equipmentId: "HakushinRing",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
