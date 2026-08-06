import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.lightbearing-moonshard.defense-percent"],
      id: "weapon.lightbearing-moonshard.defense-percent",
      label: "朏魄含光 · 防御力",
      source: weaponSource("LightbearingMoonshard"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.lightbearing-moonshard.after-skill.lunar-crystallize.reaction-damage-bonus"],
      id: "weapon.lightbearing-moonshard.after-skill.lunar-crystallize-damage-bonus",
      label: "朏魄含光 · 元素战技后月结晶伤害",
      source: weaponSource("LightbearingMoonshard"),
      status: "implemented"
    }
  ],
  equipmentId: "LightbearingMoonshard",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
