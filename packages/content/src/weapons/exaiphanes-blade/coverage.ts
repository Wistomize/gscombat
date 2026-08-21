import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed 7.0 coverage for Exaiphanes Blade. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.exaiphanes-blade.traveler.resonated-elements.crit-damage"],
      id: "weapon.exaiphanes-blade.traveler.resonated-elements.crit-damage",
      label: "星锋剑 · 旅行者已共鸣元素数量提供的暴击伤害",
      source: weaponSource("ExaiphanesBlade"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.exaiphanes-blade.after-hit.traveler.attack-percent"],
      id: "weapon.exaiphanes-blade.after-hit.traveler.attack-percent",
      label: "星锋剑 · 旅行者命中后的攻击力",
      source: weaponSource("ExaiphanesBlade"),
      status: "implemented"
    },
    {
      id: "weapon.exaiphanes-blade.after-hit.energy-restoration",
      label: "星锋剑 · 命中敌人后恢复元素能量",
      reason: "固定恢复元素能量不会改变当前单次动作伤害或元素充能效率。",
      source: weaponSource("ExaiphanesBlade"),
      status: "not_applicable"
    }
  ],
  equipmentId: "ExaiphanesBlade",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
