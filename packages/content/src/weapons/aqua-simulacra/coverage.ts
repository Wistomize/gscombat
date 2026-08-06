import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.aqua-simulacra.hp-percent", "weapon.aqua-simulacra.nearby-enemy-damage-bonus"],
      id: "weapon.aqua-simulacra.passive",
      label: "若水 · 洗濯诸类之形",
      source: weaponSource("AquaSimulacra"),
      status: "implemented"
    }
  ],
  equipmentId: "AquaSimulacra",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
