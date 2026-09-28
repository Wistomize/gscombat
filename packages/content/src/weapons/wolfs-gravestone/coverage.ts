import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.wolfs-gravestone.attack-percent"
      ],
      id: "weapon.wolfs-gravestone.attack-percent",
      label: "狼的末路 · 攻击力",
      source: {
        kind: "weapon",
        weaponId: "WolfsGravestone"
      },
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.wolfs-gravestone.after-low-health-target-hit.party-attack-percent",
        "weapon.wolfs-gravestone.after-low-health-target-hit.party-attack-percent.disabled"
      ],
      id: "weapon.wolfs-gravestone.after-low-health-target-hit.party-attack-percent",
      label: "狼的末路 · 命中低生命值敌人后的队伍攻击力",
      source: {
        kind: "weapon",
        weaponId: "WolfsGravestone"
      },
      status: "implemented"
    }
  ],
  equipmentId: "WolfsGravestone",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
