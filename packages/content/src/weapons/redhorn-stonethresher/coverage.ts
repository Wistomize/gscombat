import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.redhorn-stonethresher.defense-percent"],
      id: "weapon.redhorn-stonethresher.defense-percent",
      label: "赤角石溃杵 · 防御力",
      source: weaponSource("RedhornStonethresher"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.redhorn-stonethresher.normal-charged-defense-additive-damage"],
      id: "weapon.redhorn-stonethresher.normal-charged-defense-additive-damage",
      label: "赤角石溃杵 · 普通攻击与重击基于防御力的附加伤害",
      source: weaponSource("RedhornStonethresher"),
      status: "implemented"
    }
  ],
  equipmentId: "RedhornStonethresher",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
