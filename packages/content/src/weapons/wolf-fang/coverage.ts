import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.wolf-fang.skill-burst.damage-bonus"],
      id: "weapon.wolf-fang.skill-burst.damage-bonus",
      label: "狼牙 · 元素战技与元素爆发伤害",
      source: weaponSource("WolfFang"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.wolf-fang.skill-hit.1-stack.crit-rate",
        "weapon.wolf-fang.skill-hit.2-stack.crit-rate",
        "weapon.wolf-fang.skill-hit.3-stack.crit-rate",
        "weapon.wolf-fang.skill-hit.4-stack.crit-rate"
      ],
      id: "weapon.wolf-fang.skill-hit.crit-rate",
      label: "狼牙 · 此前元素战技命中的暴击率层数",
      source: weaponSource("WolfFang"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.wolf-fang.burst-hit.1-stack.crit-rate",
        "weapon.wolf-fang.burst-hit.2-stack.crit-rate",
        "weapon.wolf-fang.burst-hit.3-stack.crit-rate",
        "weapon.wolf-fang.burst-hit.4-stack.crit-rate"
      ],
      id: "weapon.wolf-fang.burst-hit.crit-rate",
      label: "狼牙 · 此前元素爆发命中的暴击率层数",
      source: weaponSource("WolfFang"),
      status: "implemented"
    }
  ],
  equipmentId: "WolfFang",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
