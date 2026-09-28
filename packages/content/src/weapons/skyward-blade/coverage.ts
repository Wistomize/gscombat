import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.skyward-blade.crit-rate"
      ],
      id: "weapon.skyward-blade.crit-rate",
      label: "天空之刃 · 常驻暴击率",
      source: {
        kind: "weapon",
        weaponId: "SkywardBlade"
      },
      status: "implemented"
    },
    {
      id: "weapon.skyward-blade.after-burst.additional-physical-damage",
      label: "天空之刃 · 施放元素爆发后的独立追加物理伤害",
      reason: "按已确认口径排除武器独立追加伤害，不计入当前单次角色伤害。",
      source: { kind: "weapon", weaponId: "SkywardBlade" },
      status: "not_applicable"
    },
    {
      id: "weapon.skyward-blade.after-burst.movement-and-attack-speed",
      label: "天空之刃 · 施放元素爆发后的移动速度与攻击速度",
      reason: "移动速度和攻击速度不会改变一个已选核心动作单次命中的伤害数值。",
      source: {
        kind: "weapon",
        weaponId: "SkywardBlade"
      },
      status: "not_applicable"
    }
  ],
  equipmentId: "SkywardBlade",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
