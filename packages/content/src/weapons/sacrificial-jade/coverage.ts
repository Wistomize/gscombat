import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.sacrificial-jade.after-off-field.hp-percent",
        "weapon.sacrificial-jade.after-off-field.elemental-mastery"
      ],
      id: "weapon.sacrificial-jade.after-off-field.stats",
      label: "遗祀玉珑 · 武器比较默认后台超过5秒、登场不足10秒的生命值与元素精通",
      source: weaponSource("SacrificialJade"),
      status: "implemented"
    }
  ],
  equipmentId: "SacrificialJade",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
