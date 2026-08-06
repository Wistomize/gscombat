import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.iron-sting.infusion-stinger.1-stack.damage-bonus",
        "weapon.iron-sting.infusion-stinger.2-stack.damage-bonus"
      ],
      id: "weapon.iron-sting.infusion-stinger.damage-bonus",
      label: "铁蜂刺 · 造成元素伤害后的全伤害层数",
      source: weaponSource("IronSting"),
      status: "implemented"
    }
  ],
  equipmentId: "IronSting",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
