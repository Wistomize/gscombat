import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed 7.0 coverage for Whitelake Frostfeather. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.whitelake-frostfeather.lake-hued-lament.3-stack.attack-percent"],
      id: "weapon.whitelake-frostfeather.lake-hued-lament.attack-percent",
      label: "白湖冬羽 · 湖色的哀告攻击力（按最高三层）",
      source: weaponSource("WhitelakeFrostfeather"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.whitelake-frostfeather.lake-hued-lament.3-stack.stellar-reaction-crit-damage"],
      id: "weapon.whitelake-frostfeather.lake-hued-lament.stellar-reaction-crit-damage",
      label: "白湖冬羽 · 三层时的星烁反应暴击伤害",
      source: weaponSource("WhitelakeFrostfeather"),
      status: "implemented"
    },
    {
      id: "weapon.whitelake-frostfeather.stellar-reaction-energy-restoration",
      label: "白湖冬羽 · 触发或造成星烁反应伤害时恢复元素能量",
      reason: "固定恢复元素能量不会改变当前单次动作伤害或元素充能效率。",
      source: weaponSource("WhitelakeFrostfeather"),
      status: "not_applicable"
    }
  ],
  equipmentId: "WhitelakeFrostfeather",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
