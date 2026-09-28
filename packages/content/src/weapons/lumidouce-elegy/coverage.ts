import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.lumidouce-elegy.attack-percent"
      ],
      id: "weapon.lumidouce-elegy.attack-percent",
      label: "柔灯挽歌 · 攻击力",
      source: {
        kind: "weapon",
        weaponId: "LumidouceElegy"
      },
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.lumidouce-elegy.burning.2-stack.damage-bonus"
      ],
      id: "weapon.lumidouce-elegy.burning.damage-bonus",
      label: "柔灯挽歌 · 燃烧触发后的全伤害层数",
      source: {
        kind: "weapon",
        weaponId: "LumidouceElegy"
      },
      status: "implemented"
    },
    {
      id: "weapon.lumidouce-elegy.burning.energy-restoration",
      label: "柔灯挽歌 · 燃烧状态刷新或满层后的元素能量恢复",
      reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
      source: {
        kind: "weapon",
        weaponId: "LumidouceElegy"
      },
      status: "not_applicable"
    }
  ],
  equipmentId: "LumidouceElegy",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
