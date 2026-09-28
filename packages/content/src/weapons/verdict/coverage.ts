import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.verdict.attack-percent"
      ],
      id: "weapon.verdict.attack-percent",
      label: "裁断 · 攻击力",
      source: {
        kind: "weapon",
        weaponId: "Verdict"
      },
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.verdict.rift-ripple.2-stack.skill-damage-bonus"
      ],
      id: "weapon.verdict.rift-ripple.skill-damage-bonus",
      label: "裁断 · 本次元素战技命中前持有的约印数量",
      source: {
        kind: "weapon",
        weaponId: "Verdict"
      },
      status: "implemented"
    }
  ],
  equipmentId: "Verdict",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
