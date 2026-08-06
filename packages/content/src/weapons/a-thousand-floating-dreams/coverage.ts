import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.a-thousand-floating-dreams.1-same-element-teammate.elemental-mastery",
        "weapon.a-thousand-floating-dreams.2-same-element-teammates.elemental-mastery",
        "weapon.a-thousand-floating-dreams.3-same-element-teammates.elemental-mastery",
        "weapon.a-thousand-floating-dreams.1-different-element-teammate.damage-bonus",
        "weapon.a-thousand-floating-dreams.2-different-element-teammates.damage-bonus",
        "weapon.a-thousand-floating-dreams.3-different-element-teammates.damage-bonus"
      ],
      id: "weapon.a-thousand-floating-dreams.holder.team-composition",
      label: "千夜浮梦 · 按队伍元素构成的持有者元素精通与元素伤害",
      source: weaponSource("AThousandFloatingDreams"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.a-thousand-floating-dreams.other-party.elemental-mastery"],
      id: "weapon.a-thousand-floating-dreams.other-party.elemental-mastery",
      label: "千夜浮梦 · 其他队友的元素精通与多把同名武器叠加",
      source: weaponSource("AThousandFloatingDreams", "party_member"),
      status: "implemented"
    }
  ],
  equipmentId: "AThousandFloatingDreams",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
