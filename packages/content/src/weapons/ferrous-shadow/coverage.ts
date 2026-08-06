import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.ferrous-shadow.low-hp.charged-damage-bonus"],
      id: "weapon.ferrous-shadow.low-hp.charged-damage-bonus",
      label: "铁影阔剑 · 当前生命值低于精炼阈值时的重击伤害",
      source: weaponSource("FerrousShadow"),
      status: "implemented"
    },
    {
      id: "weapon.ferrous-shadow.low-hp.interruption-resistance",
      label: "铁影阔剑 · 低生命值时抗打断能力提升",
      reason: "抗打断只影响动作是否被中断，不改变当前核心动作的一次期望数值。",
      source: weaponSource("FerrousShadow"),
      status: "not_applicable"
    }
  ],
  equipmentId: "FerrousShadow",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
