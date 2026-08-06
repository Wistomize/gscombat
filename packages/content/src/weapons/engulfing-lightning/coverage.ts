import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.engulfing-lightning.energy-recharge-to-attack",
        "weapon.engulfing-lightning.post-burst-energy-recharge"
      ],
      id: "weapon.engulfing-lightning.passive",
      label: "薙草之稻光 · 非时之梦·常世灶食",
      source: weaponSource("EngulfingLightning"),
      status: "implemented"
    }
  ],
  equipmentId: "EngulfingLightning",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
