import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.flowing-purity.after-skill.all-element-damage-bonus"],
      id: "weapon.flowing-purity.after-skill.all-element-damage-bonus",
      label: "纯水流华 · 施放元素战技后的所有元素伤害",
      source: weaponSource("FlowingPurity"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.flowing-purity.bond-of-life-cleared.full-clear.all-element-damage-bonus",
        "weapon.flowing-purity.bond-of-life-cleared.1-thousand-points.all-element-damage-bonus",
        "weapon.flowing-purity.bond-of-life-cleared.2-thousand-points.all-element-damage-bonus",
        "weapon.flowing-purity.bond-of-life-cleared.3-thousand-points.all-element-damage-bonus",
        "weapon.flowing-purity.bond-of-life-cleared.4-thousand-points.all-element-damage-bonus",
        "weapon.flowing-purity.bond-of-life-cleared.5-thousand-points.all-element-damage-bonus",
        "weapon.flowing-purity.bond-of-life-cleared.6-thousand-points.all-element-damage-bonus"
      ],
      id: "weapon.flowing-purity.bond-of-life-cleared.extra-elemental-damage-bonus",
      label: "纯水流华 · 默认完整清除24%生命之契、按实际生命上限计算额外元素增伤；兼容手选部分清除",
      source: weaponSource("FlowingPurity"),
      status: "implemented"
    }
  ],
  equipmentId: "FlowingPurity",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
