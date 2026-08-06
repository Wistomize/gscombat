import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.compound-bow.normal-or-charged-hit.1-stack.attack-percent",
        "weapon.compound-bow.normal-or-charged-hit.2-stack.attack-percent",
        "weapon.compound-bow.normal-or-charged-hit.3-stack.attack-percent",
        "weapon.compound-bow.normal-or-charged-hit.4-stack.attack-percent"
      ],
      id: "weapon.compound-bow.normal-or-charged-hit.attack-percent",
      label: "钢轮弓 · 普通攻击或重击命中后的攻击力层数",
      source: weaponSource("CompoundBow"),
      status: "implemented"
    },
    {
      id: "weapon.compound-bow.normal-or-charged-hit.attack-speed",
      label: "钢轮弓 · 普通攻击或重击命中后的攻击速度",
      reason: "攻击速度不改变一个已选核心动作的单次伤害。",
      source: weaponSource("CompoundBow"),
      status: "not_applicable"
    }
  ],
  equipmentId: "CompoundBow",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
