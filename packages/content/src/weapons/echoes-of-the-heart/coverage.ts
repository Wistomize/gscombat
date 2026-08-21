import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed 7.0 coverage for Echoes of the Heart. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.echoes-of-the-heart.after-reaction.elemental-mastery"],
      id: "weapon.echoes-of-the-heart.after-reaction.elemental-mastery",
      label: "寸心余响 · 触发元素反应后的元素精通",
      source: weaponSource("EchoesOfTheHeart"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.echoes-of-the-heart.after-stellar-reaction.reaction-damage-bonus"],
      id: "weapon.echoes-of-the-heart.after-stellar-reaction.reaction-damage-bonus",
      label: "寸心余响 · 触发星烁反应后的反应伤害",
      source: weaponSource("EchoesOfTheHeart"),
      status: "implemented"
    }
  ],
  equipmentId: "EchoesOfTheHeart",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
