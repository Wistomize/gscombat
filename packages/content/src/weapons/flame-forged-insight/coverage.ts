import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.flame-forged-insight.after-listed-reaction.elemental-mastery"],
      id: "weapon.flame-forged-insight.after-listed-reaction.elemental-mastery",
      label: "拾慧铸熔 · 触发指定元素反应后",
      source: weaponSource("FlameForgedInsight"),
      status: "implemented"
    },
    {
      id: "weapon.flame-forged-insight.energy-restoration",
      label: "拾慧铸熔 · 元素能量恢复",
      reason: "元素能量恢复影响循环资源，不改变当前已选核心动作的一次期望伤害。",
      source: weaponSource("FlameForgedInsight"),
      status: "not_applicable"
    }
  ],
  equipmentId: "FlameForgedInsight",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
