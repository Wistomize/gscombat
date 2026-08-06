import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.tome-of-the-eternal-flow.hp-percent"],
      id: "weapon.tome-of-the-eternal-flow.hp-percent",
      label: "万世流涌大典 · 生命值",
      source: weaponSource("TomeOfTheEternalFlow"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.tome-of-the-eternal-flow.raging-tides.1-stack.charged-damage-bonus",
        "weapon.tome-of-the-eternal-flow.raging-tides.2-stack.charged-damage-bonus",
        "weapon.tome-of-the-eternal-flow.raging-tides.3-stack.charged-damage-bonus"
      ],
      id: "weapon.tome-of-the-eternal-flow.raging-tides.charged-damage-bonus",
      label: "万世流涌大典 · 荡尽层数对应的重击伤害",
      source: weaponSource("TomeOfTheEternalFlow"),
      status: "implemented"
    },
    {
      id: "weapon.tome-of-the-eternal-flow.raging-tides.energy-restoration",
      label: "万世流涌大典 · 荡尽三层后的能量恢复",
      reason: "能量恢复只改变后续循环资源，不改变当前核心动作的一次期望数值。",
      source: weaponSource("TomeOfTheEternalFlow"),
      status: "not_applicable"
    }
  ],
  equipmentId: "TomeOfTheEternalFlow",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
