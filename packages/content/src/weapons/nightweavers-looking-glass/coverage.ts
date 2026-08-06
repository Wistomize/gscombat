import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.nightweavers-looking-glass.after-hydro-or-dendro-skill.elemental-mastery",
        "weapon.nightweavers-looking-glass.after-lunar-bloom.elemental-mastery"
      ],
      id: "weapon.nightweavers-looking-glass.self.elemental-mastery",
      label: "纺夜天镜 · 水草战技命中与月绽放后的自身元素精通",
      source: weaponSource("NightweaversLookingGlass"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.nightweavers-looking-glass.both-states.party-bloom.reaction-damage-bonus",
        "weapon.nightweavers-looking-glass.both-states.party-hyperbloom-burgeon.reaction-damage-bonus"
      ],
      id: "weapon.nightweavers-looking-glass.bloom-hyperbloom-burgeon.party-damage-bonus",
      label: "纺夜天镜 · 两种状态共存时队伍的绽放、超绽放与烈绽放伤害",
      source: weaponSource("NightweaversLookingGlass"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.nightweavers-looking-glass.both-states.party-lunar-bloom.reaction-damage-bonus"],
      id: "weapon.nightweavers-looking-glass.lunar-bloom.party-damage-bonus",
      label: "纺夜天镜 · 两种状态共存时队伍的月绽放伤害",
      source: weaponSource("NightweaversLookingGlass"),
      status: "implemented"
    }
  ],
  equipmentId: "NightweaversLookingGlass",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
