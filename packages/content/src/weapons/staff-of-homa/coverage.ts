import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.staff-of-homa.hp-percent"],
      id: "weapon.staff-of-homa.hp-percent",
      label: "护摩之杖 · 生命值",
      source: weaponSource("StaffOfHoma", "primary"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.staff-of-homa.hp-sourced-flat-attack"],
      id: "weapon.staff-of-homa.hp-sourced-flat-attack",
      label: "护摩之杖 · 基于生命值上限的攻击力",
      source: weaponSource("StaffOfHoma", "primary"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.staff-of-homa.hp-below-50.extra-hp-sourced-flat-attack"],
      id: "weapon.staff-of-homa.hp-below-50.extra-hp-sourced-flat-attack",
      label: "护摩之杖 · 当前生命值低于50%时的额外攻击力",
      source: weaponSource("StaffOfHoma", "primary"),
      status: "implemented"
    }
  ],
  equipmentId: "StaffOfHoma",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
