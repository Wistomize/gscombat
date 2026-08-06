import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.fruit-of-fulfillment.wax-and-wane.1-stack.elemental-mastery",
        "weapon.fruit-of-fulfillment.wax-and-wane.1-stack.attack-percent",
        "weapon.fruit-of-fulfillment.wax-and-wane.2-stack.elemental-mastery",
        "weapon.fruit-of-fulfillment.wax-and-wane.2-stack.attack-percent",
        "weapon.fruit-of-fulfillment.wax-and-wane.3-stack.elemental-mastery",
        "weapon.fruit-of-fulfillment.wax-and-wane.3-stack.attack-percent",
        "weapon.fruit-of-fulfillment.wax-and-wane.4-stack.elemental-mastery",
        "weapon.fruit-of-fulfillment.wax-and-wane.4-stack.attack-percent",
        "weapon.fruit-of-fulfillment.wax-and-wane.5-stack.elemental-mastery",
        "weapon.fruit-of-fulfillment.wax-and-wane.5-stack.attack-percent"
      ],
      id: "weapon.fruit-of-fulfillment.wax-and-wane.stats",
      label: "盈满之实 · 盈亏层数对应的元素精通与攻击力",
      source: weaponSource("FruitOfFulfillment"),
      status: "implemented"
    }
  ],
  equipmentId: "FruitOfFulfillment",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
