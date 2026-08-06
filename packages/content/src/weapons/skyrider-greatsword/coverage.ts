import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.skyrider-greatsword.courage.1-stack.attack-percent",
        "weapon.skyrider-greatsword.courage.2-stack.attack-percent",
        "weapon.skyrider-greatsword.courage.3-stack.attack-percent",
        "weapon.skyrider-greatsword.courage.4-stack.attack-percent"
      ],
      id: "weapon.skyrider-greatsword.courage.attack-percent",
      label: "飞天大御剑 · 此前普攻或重击命中后的勇气层数",
      source: weaponSource("SkyriderGreatsword"),
      status: "implemented"
    }
  ],
  equipmentId: "SkyriderGreatsword",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
