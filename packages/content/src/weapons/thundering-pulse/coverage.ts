import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.thundering-pulse.attack-percent"],
      id: "weapon.thundering-pulse.attack-percent",
      label: "飞雷之弦振 · 攻击力",
      source: weaponSource("ThunderingPulse"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.thundering-pulse.thunder-emblem.1-stack.normal-damage-bonus",
        "weapon.thundering-pulse.thunder-emblem.2-stack.normal-damage-bonus",
        "weapon.thundering-pulse.thunder-emblem.3-stack.normal-damage-bonus"
      ],
      id: "weapon.thundering-pulse.thunder-emblem.normal-damage-bonus",
      label: "飞雷之弦振 · 飞雷之巴印层数对应的普通攻击伤害",
      source: weaponSource("ThunderingPulse"),
      status: "implemented"
    }
  ],
  equipmentId: "ThunderingPulse",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
