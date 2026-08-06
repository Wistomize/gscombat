import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.the-widsith.recitative.attack-percent",
        "weapon.the-widsith.aria.all-element-damage-bonus",
        "weapon.the-widsith.interlude.elemental-mastery"
      ],
      id: "weapon.the-widsith.theme",
      label: "流浪乐章 · 登场主题随机分支",
      source: weaponSource("TheWidsith"),
      status: "implemented"
    }
  ],
  equipmentId: "TheWidsith",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
