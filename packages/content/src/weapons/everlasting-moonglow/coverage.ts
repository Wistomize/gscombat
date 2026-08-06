import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.everlasting-moonglow.outgoing-healing-bonus"],
      id: "weapon.everlasting-moonglow.outgoing-healing-bonus",
      label: "不灭月华 · 治疗加成",
      source: weaponSource("EverlastingMoonglow"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.everlasting-moonglow.normal-hp-additive-damage"],
      id: "weapon.everlasting-moonglow.normal-hp-additive-damage",
      label: "不灭月华 · 普通攻击基于生命值上限的附加伤害",
      source: weaponSource("EverlastingMoonglow"),
      status: "implemented"
    },
    {
      id: "weapon.everlasting-moonglow.after-burst.normal-hit.energy-restoration",
      label: "不灭月华 · 元素爆发后普通攻击命中的元素能量恢复",
      reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
      source: weaponSource("EverlastingMoonglow"),
      status: "not_applicable"
    }
  ],
  equipmentId: "EverlastingMoonglow",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
