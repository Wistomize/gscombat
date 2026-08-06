import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.solar-pearl.after-normal-hit.skill-burst-damage-bonus"],
      id: "weapon.solar-pearl.after-normal-hit.skill-burst-damage-bonus",
      label: "匣里日月 · 普通攻击命中后（元素战技与元素爆发伤害）",
      source: weaponSource("SolarPearl"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.solar-pearl.after-skill-or-burst-hit.normal-damage-bonus"],
      id: "weapon.solar-pearl.after-skill-or-burst-hit.normal-damage-bonus",
      label: "匣里日月 · 元素战技或元素爆发命中后（普通攻击伤害）",
      source: weaponSource("SolarPearl"),
      status: "implemented"
    }
  ],
  equipmentId: "SolarPearl",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
