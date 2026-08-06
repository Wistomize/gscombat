import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.fruitful-hook.plunge-crit-rate",
        "weapon.fruitful-hook.after-plunge.normal-charged-plunge-damage-bonus"
      ],
      id: "weapon.fruitful-hook.passive",
      label: "硕果钩 · 坠枝之重",
      source: weaponSource("FruitfulHook"),
      status: "implemented"
    }
  ],
  equipmentId: "FruitfulHook",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
