import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.polar-star.skill-burst-damage-bonus",
        "weapon.polar-star.ashen-nightstar.1-stack.attack-percent",
        "weapon.polar-star.ashen-nightstar.2-stack.attack-percent",
        "weapon.polar-star.ashen-nightstar.3-stack.attack-percent",
        "weapon.polar-star.ashen-nightstar.4-stack.attack-percent"
      ],
      id: "weapon.polar-star.passive",
      label: "冬极白星 · 元素战技与元素爆发伤害、白夜极星层数攻击力",
      source: weaponSource("PolarStar"),
      status: "implemented"
    }
  ],
  equipmentId: "PolarStar",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
