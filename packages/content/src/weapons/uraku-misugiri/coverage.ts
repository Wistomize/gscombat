import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.uraku-misugiri.normal-damage-bonus",
        "weapon.uraku-misugiri.skill-damage-bonus",
        "weapon.uraku-misugiri.defense-percent",
        "weapon.uraku-misugiri.after-geo-hit.extra-normal-damage-bonus",
        "weapon.uraku-misugiri.after-geo-hit.extra-skill-damage-bonus"
      ],
      id: "weapon.uraku-misugiri.passive",
      label: "有乐御簾切 · 锦之花与龛中剑",
      source: weaponSource("UrakuMisugiri"),
      status: "implemented"
    }
  ],
  equipmentId: "UrakuMisugiri",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
