import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.the-black-sword.normal-charged-damage-bonus"],
      id: "weapon.the-black-sword.normal-charged-damage-bonus",
      label: "黑剑 · 普通攻击与重击伤害",
      source: weaponSource("TheBlackSword"),
      status: "implemented"
    },
    {
      id: "weapon.the-black-sword.normal-charged-crit-healing",
      label: "黑剑 · 普通攻击与重击暴击治疗",
      reason: "普通攻击与重击暴击后的治疗不进入当前角色核心动作伤害。",
      source: weaponSource("TheBlackSword"),
      status: "not_applicable"
    }
  ],
  equipmentId: "TheBlackSword",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
