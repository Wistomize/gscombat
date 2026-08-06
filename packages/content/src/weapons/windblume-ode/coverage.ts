import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.windblume-ode.after-skill.attack-percent"],
      id: "weapon.windblume-ode.after-skill.attack-percent",
      label: "风花之颂 · 此前施放元素战技后的攻击力",
      source: weaponSource("WindblumeOde"),
      status: "implemented"
    }
  ],
  equipmentId: "WindblumeOde",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
