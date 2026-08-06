import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.golden-frostbound-oath.defense-percent",
        "weapon.golden-frostbound-oath.frost-fairys-requital.geo-damage-bonus"
      ],
      id: "weapon.golden-frostbound-oath.self-defense-and-geo-damage-bonus",
      label: "霜结的誓金枝 · 防御力与霜妖精的报恩岩元素伤害",
      source: weaponSource("GoldenFrostboundOath"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.golden-frostbound-oath.frost-fairys-requital.lunar-crystallize.reaction-damage-bonus"],
      id: "weapon.golden-frostbound-oath.frost-fairys-requital.lunar-crystallize-damage-bonus",
      label: "霜结的誓金枝 · 霜妖精的报恩月结晶伤害",
      source: weaponSource("GoldenFrostboundOath"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.golden-frostbound-oath.frost-fairys-mischief.active.mooncage-nearby-other-party-geo-damage-bonus"
      ],
      id: "weapon.golden-frostbound-oath.frost-fairys-mischief.active.mooncage-nearby-other-party-geo-damage-bonus",
      label: "霜结的誓金枝 · 月笼附近其他队友的岩元素伤害",
      source: weaponSource("GoldenFrostboundOath", "party_member"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.golden-frostbound-oath.frost-fairys-mischief.active.mooncage-nearby-other-party-lunar-crystallize.reaction-damage-bonus"
      ],
      id: "weapon.golden-frostbound-oath.frost-fairys-mischief.active.mooncage-nearby-other-party-lunar-crystallize.reaction-damage-bonus",
      label: "霜结的誓金枝 · 月笼附近其他队友的月结晶反应伤害",
      source: weaponSource("GoldenFrostboundOath", "party_member"),
      status: "implemented"
    }
  ],
  equipmentId: "GoldenFrostboundOath",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
