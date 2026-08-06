import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.skyrider-sword.after-burst.attack-percent"],
      id: "weapon.skyrider-sword.after-burst.attack-percent",
      label: "飞天御剑 · 施放元素爆发后（攻击力）",
      source: weaponSource("SkyriderSword"),
      status: "implemented"
    },
    {
      id: "weapon.skyrider-sword.after-burst.movement-speed",
      label: "飞天御剑 · 施放元素爆发后（移动速度）",
      reason: "移动速度不改变当前核心动作的单次期望伤害，需循环时间模型。",
      source: weaponSource("SkyriderSword"),
      status: "not_applicable"
    }
  ],
  equipmentId: "SkyriderSword",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
