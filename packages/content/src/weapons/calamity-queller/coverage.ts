import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
  "weapon.calamity-queller.all-element-damage-bonus",
  "weapon.calamity-queller.consumption.on-field.6-stack.attack-percent",
  "weapon.calamity-queller.consumption.off-field.6-stack.attack-percent"
],
      id: "weapon.calamity-queller.passive",
      label: "息灾 · 灭却之戒法",
      source: weaponSource("CalamityQueller"),
      status: "implemented"
    }
  ],
  equipmentId: "CalamityQueller",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
