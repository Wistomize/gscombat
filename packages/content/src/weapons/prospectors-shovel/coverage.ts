import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.prospectors-shovel.electro-charged.reaction-damage-bonus"],
      id: "weapon.prospectors-shovel.electro-charged-damage-bonus",
      label: "掘金之锹 · 感电反应伤害",
      source: weaponSource("ProspectorsShovel"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.prospectors-shovel.lunar-charged.reaction-damage-bonus",
        "weapon.prospectors-shovel.full-moonsign.lunar-charged.reaction-damage-bonus"
      ],
      id: "weapon.prospectors-shovel.lunar-charged-damage-bonus",
      label: "掘金之锹 · 月感电反应伤害与满辉额外提升",
      source: weaponSource("ProspectorsShovel"),
      status: "implemented"
    }
  ],
  equipmentId: "ProspectorsShovel",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
