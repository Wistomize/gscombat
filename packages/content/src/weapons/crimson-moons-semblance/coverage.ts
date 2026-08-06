import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.crimson-moons-semblance.bond-of-life.below-thirty-percent.damage-bonus",
        "weapon.crimson-moons-semblance.bond-of-life.at-least-thirty-percent.damage-bonus"
      ],
      id: "weapon.crimson-moons-semblance.bond-of-life.damage-bonus",
      label: "赤月之形 · 低于或不低于生命值上限30%的生命之契下造成的伤害",
      source: weaponSource("CrimsonMoonsSemblance"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.crimson-moons-semblance.charged-hit.bond-of-life"],
      id: "weapon.crimson-moons-semblance.charged-hit.bond-generation",
      label: "赤月之形 · 重击命中后赋予生命之契",
      source: weaponSource("CrimsonMoonsSemblance"),
      status: "implemented"
    }
  ],
  equipmentId: "CrimsonMoonsSemblance",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
