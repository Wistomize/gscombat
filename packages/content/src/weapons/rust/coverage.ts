import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.rust.normal-damage-bonus"],
      id: "weapon.rust.normal-damage-bonus",
      label: "弓藏 · 普通攻击伤害",
      source: weaponSource("Rust"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.rust.charged-damage-penalty"],
      id: "weapon.rust.charged-damage-penalty",
      label: "弓藏 · 重击伤害降低",
      source: weaponSource("Rust"),
      status: "implemented"
    }
  ],
  equipmentId: "Rust",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
