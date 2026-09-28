import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.iron-sting.infusion-stinger.2-stack.damage-bonus"
      ],
      id: "weapon.iron-sting.infusion-stinger.damage-bonus",
      label: "铁蜂刺 · 造成元素伤害后的全伤害层数",
      source: {
        kind: "weapon",
        weaponId: "IronSting"
      },
      status: "implemented"
    }
  ],
  equipmentId: "IronSting",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
