import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.absolution.crit-damage"],
      id: "weapon.absolution.crit-damage",
      label: "赦罪 · 暴击伤害",
      source: weaponSource("Absolution", "primary"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.absolution.bond-of-life-increase.1-stack.damage-bonus",
        "weapon.absolution.bond-of-life-increase.2-stack.damage-bonus",
        "weapon.absolution.bond-of-life-increase.3-stack.damage-bonus"
      ],
      id: "weapon.absolution.bond-of-life-increase.damage-bonus",
      label: "赦罪 · 生命之契数值增加后的伤害提升",
      source: weaponSource("Absolution", "primary"),
      status: "implemented"
    }
  ],
  equipmentId: "Absolution",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
