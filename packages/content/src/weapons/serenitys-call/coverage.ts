import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.serenitys-call.after-reaction.hp-percent",
        "weapon.serenitys-call.after-reaction.full-moon.hp-percent"
      ],
      id: "weapon.serenitys-call.after-reaction.hp-percent",
      label: "谧音吹哨 · 触发元素反应后的生命值与月兆·满辉分支",
      source: weaponSource("SerenitysCall"),
      status: "implemented"
    }
  ],
  equipmentId: "SerenitysCall",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
