import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.prototype-amber.after-burst.energy-restoration",
      label: "试作金珀 · 元素爆发后的元素能量恢复",
      reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
      source: weaponSource("PrototypeAmber"),
      status: "not_applicable"
    },
    {
      id: "weapon.prototype-amber.after-burst.party-healing",
      label: "试作金珀 · 元素爆发后的队伍持续治疗",
      reason: "元素爆发后的队伍治疗不进入当前角色核心动作伤害。",
      source: weaponSource("PrototypeAmber"),
      status: "not_applicable"
    }
  ],
  equipmentId: "PrototypeAmber",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
