import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.lost-prayer-to-the-sacred-winds.movement.1-stack.all-element-damage-bonus",
        "weapon.lost-prayer-to-the-sacred-winds.movement.2-stack.all-element-damage-bonus",
        "weapon.lost-prayer-to-the-sacred-winds.movement.3-stack.all-element-damage-bonus",
        "weapon.lost-prayer-to-the-sacred-winds.movement.4-stack.all-element-damage-bonus"
      ],
      id: "weapon.lost-prayer-to-the-sacred-winds.movement.all-element-damage-bonus",
      label: "四风原典 · 登场后层数对应的所有元素伤害",
      source: weaponSource("LostPrayerToTheSacredWinds"),
      status: "implemented"
    },
    {
      id: "weapon.lost-prayer-to-the-sacred-winds.movement-speed",
      label: "四风原典 · 移动速度",
      reason: "移动速度不改变一个已选核心动作的单次伤害。",
      source: weaponSource("LostPrayerToTheSacredWinds"),
      status: "not_applicable"
    }
  ],
  equipmentId: "LostPrayerToTheSacredWinds",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
