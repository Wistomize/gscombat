import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.flowing-purity.after-skill.all-element-damage-bonus"
      ],
      id: "weapon.flowing-purity.after-skill.all-element-damage-bonus",
      label: "纯水流华 · 施放元素战技后的所有元素伤害",
      source: {
        kind: "weapon",
        weaponId: "FlowingPurity"
      },
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.flowing-purity.bond-of-life-cleared.full-clear.all-element-damage-bonus"
      ],
      id: "weapon.flowing-purity.bond-of-life-cleared.extra-elemental-damage-bonus",
      label: "纯水流华 · 有适用治疗并施放战技后，完整清除最终生命24%的生命之契，连续换算额外元素增伤并封顶",
      source: {
        kind: "weapon",
        weaponId: "FlowingPurity"
      },
      status: "implemented"
    }
  ],
  equipmentId: "FlowingPurity",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
