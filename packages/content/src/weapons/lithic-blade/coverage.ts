import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.lithic-blade.liyue-party.1-character.attack-percent",
        "weapon.lithic-blade.liyue-party.1-character.crit-rate",
        "weapon.lithic-blade.liyue-party.2-character.attack-percent",
        "weapon.lithic-blade.liyue-party.2-character.crit-rate",
        "weapon.lithic-blade.liyue-party.3-character.attack-percent",
        "weapon.lithic-blade.liyue-party.3-character.crit-rate",
        "weapon.lithic-blade.liyue-party.4-character.attack-percent",
        "weapon.lithic-blade.liyue-party.4-character.crit-rate"
      ],
      id: "weapon.lithic-blade.liyue-party.stats",
      label: "千岩古剑 · 队伍璃月角色数对应的攻击力与暴击率",
      source: weaponSource("LithicBlade"),
      status: "implemented"
    }
  ],
  equipmentId: "LithicBlade",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
