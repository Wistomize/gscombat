import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.polar-star.skill-burst-damage-bonus",
        "weapon.polar-star.ashen-nightstar.4-stack.attack-percent"
      ],
      id: "weapon.polar-star.passive",
      label: "冬极白星 · 元素战技与元素爆发伤害、白夜极星层数攻击力",
      source: {
        kind: "weapon",
        weaponId: "PolarStar"
      },
      status: "implemented"
    }
  ],
  equipmentId: "PolarStar",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
