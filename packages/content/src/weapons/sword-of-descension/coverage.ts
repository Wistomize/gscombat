import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.sword-of-descension.descension.physical-hit"],
      id: "weapon.sword-of-descension.descension.physical-hit",
      label: "降临之剑 · 冷却就绪时的降临物理伤害",
      source: weaponSource("SwordOfDescension"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.sword-of-descension.descension.physical-hit",
        "weapon.sword-of-descension.playstation.traveler.flat-attack"
      ],
      id: "weapon.sword-of-descension.platform-eligibility",
      label: "降临之剑 · PlayStation Network 被动已生效快照",
      source: weaponSource("SwordOfDescension"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.sword-of-descension.playstation.traveler.flat-attack"],
      id: "weapon.sword-of-descension.traveler-flat-attack",
      label: "降临之剑 · 旅行者装备时的固定攻击力",
      source: weaponSource("SwordOfDescension"),
      status: "implemented"
    }
  ],
  equipmentId: "SwordOfDescension",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
