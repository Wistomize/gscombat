import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed 7.0 coverage for Frostbreath. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.frostbreath.after-cryo-or-hydro-reaction.attack-percent"],
      id: "weapon.frostbreath.after-cryo-or-hydro-reaction.attack-percent",
      label: "寒息 · 触发冰元素或水元素相关反应后的攻击力",
      source: weaponSource("Frostbreath"),
      status: "implemented"
    },
    {
      id: "weapon.frostbreath.party-energy-restoration",
      label: "寒息 · 为队伍中其他角色恢复元素能量",
      reason: "固定恢复元素能量不会改变当前单次动作伤害或元素充能效率。",
      source: weaponSource("Frostbreath"),
      status: "not_applicable"
    }
  ],
  equipmentId: "Frostbreath",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
