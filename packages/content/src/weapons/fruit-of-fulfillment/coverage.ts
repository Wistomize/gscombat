import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.fruit-of-fulfillment.wax-and-wane.5-stack.elemental-mastery",
        "weapon.fruit-of-fulfillment.wax-and-wane.5-stack.attack-percent"
      ],
      id: "weapon.fruit-of-fulfillment.wax-and-wane.stats",
      label: "盈满之实 · 盈亏层数对应的元素精通与攻击力",
      source: {
        kind: "weapon",
        weaponId: "FruitOfFulfillment"
      },
      status: "implemented"
    }
  ],
  equipmentId: "FruitOfFulfillment",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
