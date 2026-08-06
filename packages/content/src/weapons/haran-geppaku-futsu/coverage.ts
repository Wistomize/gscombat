import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.haran-geppaku-futsu.all-element-damage-bonus",
        "weapon.haran-geppaku-futsu.wavespike.1-stack.normal-damage-bonus",
        "weapon.haran-geppaku-futsu.wavespike.2-stack.normal-damage-bonus"
      ],
      id: "weapon.haran-geppaku-futsu.passive",
      label: "波乱月白经津 · 所有元素伤害与波穗普通攻击伤害",
      source: weaponSource("HaranGeppakuFutsu"),
      status: "implemented"
    }
  ],
  equipmentId: "HaranGeppakuFutsu",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
