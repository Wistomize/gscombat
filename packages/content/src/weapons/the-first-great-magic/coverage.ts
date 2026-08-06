import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.the-first-great-magic.charged-damage-bonus"],
      id: "weapon.the-first-great-magic.charged-damage-bonus",
      label: "最初的大魔术 · 重击伤害",
      source: weaponSource("TheFirstGreatMagic"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.the-first-great-magic.same-element-party.1-character.attack-percent",
        "weapon.the-first-great-magic.same-element-party.2-character.attack-percent",
        "weapon.the-first-great-magic.same-element-party.3-character.attack-percent"
      ],
      id: "weapon.the-first-great-magic.same-element-party.attack-percent",
      label: "最初的大魔术 · 同元素队友数量对应的攻击力",
      source: weaponSource("TheFirstGreatMagic"),
      status: "implemented"
    },
    {
      id: "weapon.the-first-great-magic.different-element-party-movement-speed",
      label: "最初的大魔术 · 异元素队友数量对应的移动速度",
      reason: "移动速度只影响位移与循环，不改变当前核心动作的一次期望数值。",
      source: weaponSource("TheFirstGreatMagic"),
      status: "not_applicable"
    }
  ],
  equipmentId: "TheFirstGreatMagic",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
