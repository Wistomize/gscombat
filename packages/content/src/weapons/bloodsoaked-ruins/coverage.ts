import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.bloodsoaked-ruins.after-burst.lunar-charged.reaction-damage-bonus"],
      id: "weapon.bloodsoaked-ruins.after-burst.lunar-charged-damage-bonus",
      label: "血染荒城 · 施放元素爆发后的月感电伤害",
      source: weaponSource("BloodsoakedRuins"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.bloodsoaked-ruins.after-lunar-charged.crit-damage"],
      id: "weapon.bloodsoaked-ruins.after-lunar-charged.crit-damage",
      label: "血染荒城 · 触发月感电后的暴击伤害",
      source: weaponSource("BloodsoakedRuins"),
      status: "implemented"
    },
    {
      id: "weapon.bloodsoaked-ruins.after-lunar-charged.energy-restoration",
      label: "血染荒城 · 触发月感电后的元素能量恢复",
      reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
      source: weaponSource("BloodsoakedRuins"),
      status: "not_applicable"
    }
  ],
  equipmentId: "BloodsoakedRuins",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
