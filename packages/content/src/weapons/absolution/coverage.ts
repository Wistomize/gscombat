import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.absolution.crit-damage"
      ],
      id: "weapon.absolution.crit-damage",
      label: "赦罪 · 暴击伤害",
      source: {
        holder: "primary",
        kind: "weapon",
        weaponId: "Absolution"
      },
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.absolution.bond-of-life-increase.3-stack.damage-bonus"
      ],
      id: "weapon.absolution.bond-of-life-increase.damage-bonus",
      label: "赦罪 · 生命之契数值增加后的伤害提升",
      source: {
        holder: "primary",
        kind: "weapon",
        weaponId: "Absolution"
      },
      status: "implemented"
    }
  ],
  equipmentId: "Absolution",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
