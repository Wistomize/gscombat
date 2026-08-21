import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed 7.0 coverage for Heretic's Molten Blade. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.heretics-molten-blade.after-skill.maximum-movement.attack-percent"],
      id: "weapon.heretics-molten-blade.after-skill.movement.attack-percent",
      label: "熔猎异端之刃 · 映落瞳中的初光攻击力",
      source: weaponSource("HereticsMoltenBlade"),
      status: "implemented"
    },
    {
      id: "weapon.heretics-molten-blade.leave-field-removal",
      label: "熔猎异端之刃 · 退场移除效果",
      reason: "该条仅限制增益快照的可用时段，不额外改变一次动作的数值。",
      source: weaponSource("HereticsMoltenBlade"),
      status: "not_applicable"
    }
  ],
  equipmentId: "HereticsMoltenBlade",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
