import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.lumidouce-elegy.attack-percent"],
      id: "weapon.lumidouce-elegy.attack-percent",
      label: "柔灯挽歌 · 攻击力",
      source: weaponSource("LumidouceElegy"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.lumidouce-elegy.burning.1-stack.damage-bonus",
        "weapon.lumidouce-elegy.burning.2-stack.damage-bonus"
      ],
      id: "weapon.lumidouce-elegy.burning.damage-bonus",
      label: "柔灯挽歌 · 燃烧触发后的全伤害层数",
      source: weaponSource("LumidouceElegy"),
      status: "implemented"
    },
    {
      id: "weapon.lumidouce-elegy.burning.energy-restoration",
      label: "柔灯挽歌 · 燃烧状态刷新或满层后的元素能量恢复",
      reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
      source: weaponSource("LumidouceElegy"),
      status: "not_applicable"
    }
  ],
  equipmentId: "LumidouceElegy",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
