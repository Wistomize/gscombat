import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.scion-of-the-blazing-sun.sunfire-arrow.physical-hit",
        "weapon.scion-of-the-blazing-sun.heartsearer-target.charged-damage-bonus"
      ],
      id: "weapon.scion-of-the-blazing-sun.passive",
      label: "烈阳之嗣 · 冷却就绪的阳炎矢与灼心目标重击伤害",
      source: weaponSource("ScionOfTheBlazingSun"),
      status: "implemented"
    }
  ],
  equipmentId: "ScionOfTheBlazingSun",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
