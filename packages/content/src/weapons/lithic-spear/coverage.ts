import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.lithic-spear.liyue-party.1-character.attack-percent",
        "weapon.lithic-spear.liyue-party.1-character.crit-rate",
        "weapon.lithic-spear.liyue-party.2-character.attack-percent",
        "weapon.lithic-spear.liyue-party.2-character.crit-rate",
        "weapon.lithic-spear.liyue-party.3-character.attack-percent",
        "weapon.lithic-spear.liyue-party.3-character.crit-rate",
        "weapon.lithic-spear.liyue-party.4-character.attack-percent",
        "weapon.lithic-spear.liyue-party.4-character.crit-rate"
      ],
      id: "weapon.lithic-spear.liyue-party.stats",
      label: "千岩长枪 · 队伍璃月角色数对应的攻击力与暴击率",
      source: weaponSource("LithicSpear"),
      status: "implemented"
    }
  ],
  equipmentId: "LithicSpear",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
