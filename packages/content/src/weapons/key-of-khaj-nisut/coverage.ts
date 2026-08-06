import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.key-of-khaj-nisut.hp-percent"],
      id: "weapon.key-of-khaj-nisut.hp-percent",
      label: "圣显之钥 · 生命值",
      source: weaponSource("KeyOfKhajNisut"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.key-of-khaj-nisut.grand-hymn.1-stack.final-hp-to-elemental-mastery",
        "weapon.key-of-khaj-nisut.grand-hymn.2-stack.final-hp-to-elemental-mastery",
        "weapon.key-of-khaj-nisut.grand-hymn.3-stack.final-hp-to-elemental-mastery"
      ],
      id: "weapon.key-of-khaj-nisut.grand-hymn.self-hp-scaled-elemental-mastery",
      label: "圣显之钥 · 圣咏层数对应的持有者生命值元素精通",
      source: weaponSource("KeyOfKhajNisut"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.key-of-khaj-nisut.grand-hymn.3-stack.party-source-final-hp-to-elemental-mastery"],
      id: "weapon.key-of-khaj-nisut.grand-hymn.party-hp-scaled-elemental-mastery",
      label: "圣显之钥 · 三层圣咏后的队伍生命值元素精通",
      source: weaponSource("KeyOfKhajNisut"),
      status: "implemented"
    }
  ],
  equipmentId: "KeyOfKhajNisut",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
