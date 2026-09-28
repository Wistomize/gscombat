import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.skyrider-greatsword.courage.4-stack.attack-percent"
      ],
      id: "weapon.skyrider-greatsword.courage.attack-percent",
      label: "飞天大御剑 · 此前普攻或重击命中后的勇气层数",
      source: {
        kind: "weapon",
        weaponId: "SkyriderGreatsword"
      },
      status: "implemented"
    }
  ],
  equipmentId: "SkyriderGreatsword",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
