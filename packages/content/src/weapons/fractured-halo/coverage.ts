import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.fractured-halo.after-skill-or-burst.self-attack-percent"],
      id: "weapon.fractured-halo.after-skill-or-burst.self-attack-percent",
      label: "支离轮光 · 施放元素战技或元素爆发后的攻击力",
      source: weaponSource("FracturedHalo"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.fractured-halo.after-shield.party-lunar-charged.reaction-damage-bonus"],
      id: "weapon.fractured-halo.after-shield.party-lunar-charged-damage-bonus",
      label: "支离轮光 · 创造护盾后附近队伍角色的月感电伤害",
      source: weaponSource("FracturedHalo"),
      status: "implemented"
    }
  ],
  equipmentId: "FracturedHalo",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
