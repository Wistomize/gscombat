import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.cranes-echoing-call.after-plunge-hit.party-plunge-damage-bonus"],
      id: "weapon.cranes-echoing-call.after-plunge-hit.party-plunge-damage-bonus",
      label: "鹤鸣余音 · 装备者下落攻击命中后的队伍下落攻击伤害",
      source: weaponSource("CranesEchoingCall"),
      status: "implemented"
    },
    {
      id: "weapon.cranes-echoing-call.party-plunge-hit.energy-restoration",
      label: "鹤鸣余音 · 队伍下落攻击命中的元素能量恢复",
      reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
      source: weaponSource("CranesEchoingCall"),
      status: "not_applicable"
    }
  ],
  equipmentId: "CranesEchoingCall",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
