import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.wolfs-gravestone.attack-percent"],
      id: "weapon.wolfs-gravestone.attack-percent",
      label: "狼的末路 · 攻击力",
      source: weaponSource("WolfsGravestone"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.wolfs-gravestone.after-low-health-target-hit.party-attack-percent"],
      id: "weapon.wolfs-gravestone.after-low-health-target-hit.party-attack-percent",
      label: "狼的末路 · 命中低生命值敌人后的队伍攻击力",
      source: weaponSource("WolfsGravestone"),
      status: "implemented"
    }
  ],
  equipmentId: "WolfsGravestone",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
