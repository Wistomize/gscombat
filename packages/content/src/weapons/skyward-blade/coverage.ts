import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.skyward-blade.crit-rate", "weapon.skyward-blade.after-burst.additional-physical-damage"],
      id: "weapon.skyward-blade.crit-rate-and-physical-hit",
      label: "天空之刃 · 暴击率与施放元素爆发后的额外物理伤害",
      source: weaponSource("SkywardBlade"),
      status: "implemented"
    },
    {
      id: "weapon.skyward-blade.after-burst.movement-and-attack-speed",
      label: "天空之刃 · 施放元素爆发后的移动速度与攻击速度",
      reason: "移动速度和攻击速度不会改变一个已选核心动作单次命中的伤害数值。",
      source: weaponSource("SkywardBlade"),
      status: "not_applicable"
    }
  ],
  equipmentId: "SkywardBlade",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
