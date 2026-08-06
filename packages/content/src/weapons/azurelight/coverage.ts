import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.azurelight.after-skill.attack-percent",
        "weapon.azurelight.after-skill.zero-energy.extra-attack-percent",
        "weapon.azurelight.after-skill.zero-energy.crit-damage"
      ],
      id: "weapon.azurelight.after-skill.stats",
      label: "苍耀 · 施放元素战技后与元素能量为0时的数值",
      source: weaponSource("Azurelight"),
      status: "implemented"
    }
  ],
  equipmentId: "Azurelight",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
