import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.verdict.attack-percent"],
      id: "weapon.verdict.attack-percent",
      label: "裁断 · 攻击力",
      source: weaponSource("Verdict"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.verdict.rift-ripple.1-stack.skill-damage-bonus",
        "weapon.verdict.rift-ripple.2-stack.skill-damage-bonus"
      ],
      id: "weapon.verdict.rift-ripple.skill-damage-bonus",
      label: "裁断 · 本次元素战技命中前持有的约印数量",
      source: weaponSource("Verdict"),
      status: "implemented"
    }
  ],
  equipmentId: "Verdict",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
