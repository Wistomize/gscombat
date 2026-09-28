import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.scion-of-the-blazing-sun.heartsearer-target.charged-damage-bonus"
      ],
      id: "weapon.scion-of-the-blazing-sun.passive",
      label: "烈阳之嗣 · 本人具有重击命中能力时默认准备灼心，计入目标重击增伤",
      source: {
        kind: "weapon",
        weaponId: "ScionOfTheBlazingSun"
      },
      status: "implemented"
    },
    {
      id: "weapon.scion-of-the-blazing-sun.sunfire-arrow.physical-hit",
      label: "烈阳之嗣 · 阳炎矢独立追加伤害",
      reason: "按已确认口径排除武器独立追加伤害，不影响灼心目标的重击增伤。",
      source: { kind: "weapon", weaponId: "ScionOfTheBlazingSun" },
      status: "not_applicable"
    }
  ],
  equipmentId: "ScionOfTheBlazingSun",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
