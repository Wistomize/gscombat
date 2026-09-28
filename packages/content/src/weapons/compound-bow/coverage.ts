import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.compound-bow.normal-or-charged-hit.4-stack.attack-percent"
      ],
      id: "weapon.compound-bow.normal-or-charged-hit.attack-percent",
      label: "钢轮弓 · 普通攻击或重击命中后的攻击力层数",
      source: {
        kind: "weapon",
        weaponId: "CompoundBow"
      },
      status: "implemented"
    },
    {
      id: "weapon.compound-bow.normal-or-charged-hit.attack-speed",
      label: "钢轮弓 · 普通攻击或重击命中后的攻击速度",
      reason: "攻击速度不改变一个已选核心动作的单次伤害。",
      source: {
        kind: "weapon",
        weaponId: "CompoundBow"
      },
      status: "not_applicable"
    }
  ],
  equipmentId: "CompoundBow",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
