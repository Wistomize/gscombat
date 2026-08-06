import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.slingshot.flight-time.within-0.3-seconds.damage-bonus",
        "weapon.slingshot.flight-time.after-0.3-seconds.damage-penalty"
      ],
      id: "weapon.slingshot.flight-time.damage-bonus",
      label: "弹弓 · 本次普攻或重击箭矢飞行时间对应的伤害",
      source: weaponSource("Slingshot"),
      status: "implemented"
    }
  ],
  equipmentId: "Slingshot",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
