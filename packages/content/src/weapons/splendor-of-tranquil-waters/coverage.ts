import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.splendor-of-tranquil-waters.self-hp-change.1-stack.skill-damage-bonus",
        "weapon.splendor-of-tranquil-waters.self-hp-change.2-stack.skill-damage-bonus",
        "weapon.splendor-of-tranquil-waters.self-hp-change.3-stack.skill-damage-bonus"
      ],
      id: "weapon.splendor-of-tranquil-waters.self-hp-change.skill-damage-bonus",
      label: "静水流涌之辉 · 自身生命值变动后的元素战技伤害层数",
      source: weaponSource("SplendorOfTranquilWaters"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.splendor-of-tranquil-waters.teammate-hp-change.1-stack.hp-percent",
        "weapon.splendor-of-tranquil-waters.teammate-hp-change.2-stack.hp-percent"
      ],
      id: "weapon.splendor-of-tranquil-waters.teammate-hp-change.hp-percent",
      label: "静水流涌之辉 · 其他队友生命值变动后的生命值层数",
      source: weaponSource("SplendorOfTranquilWaters"),
      status: "implemented"
    }
  ],
  equipmentId: "SplendorOfTranquilWaters",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
