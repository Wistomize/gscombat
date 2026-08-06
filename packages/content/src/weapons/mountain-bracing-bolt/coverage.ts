import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.mountain-bracing-bolt.skill-damage-bonus",
        "weapon.mountain-bracing-bolt.after-teammate-skill.extra-skill-damage-bonus"
      ],
      id: "weapon.mountain-bracing-bolt.skill-damage-bonus",
      label: "镇山之钉 · 元素战技伤害与队友施放元素战技后的额外伤害",
      source: weaponSource("MountainBracingBolt"),
      status: "implemented"
    },
    {
      id: "weapon.mountain-bracing-bolt.climbing-stamina",
      label: "镇山之钉 · 攀爬体力消耗降低",
      reason: "体力消耗只影响移动与循环，不改变一个已选核心动作单次命中的伤害数值。",
      source: weaponSource("MountainBracingBolt"),
      status: "not_applicable"
    }
  ],
  equipmentId: "MountainBracingBolt",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
