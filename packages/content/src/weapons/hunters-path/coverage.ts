import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.hunters-path.all-element-damage-bonus"],
      id: "weapon.hunters-path.all-element-damage-bonus",
      label: "猎人之径 · 所有元素伤害",
      source: weaponSource("HuntersPath"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.hunters-path.tireless-hunt.charged-em-additive-damage"],
      id: "weapon.hunters-path.tireless-hunt.charged-em-additive-damage",
      label: "猎人之径 · 无休止的狩猎重击元素精通附加伤害",
      source: weaponSource("HuntersPath"),
      status: "implemented"
    }
  ],
  equipmentId: "HuntersPath",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
