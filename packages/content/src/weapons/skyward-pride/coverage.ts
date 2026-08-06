import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.skyward-pride.damage-bonus"],
      id: "weapon.skyward-pride.damage-bonus",
      label: "天空之傲 · 造成的伤害",
      source: weaponSource("SkywardPride"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.skyward-pride.vacuum-blade"],
      id: "weapon.skyward-pride.vacuum-blade",
      label: "天空之傲 · 真空刃（元素爆发后，本次命中可触发）",
      source: weaponSource("SkywardPride"),
      status: "implemented"
    }
  ],
  equipmentId: "SkywardPride",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
