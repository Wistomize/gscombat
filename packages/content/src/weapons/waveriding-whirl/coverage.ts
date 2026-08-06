import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.waveriding-whirl.hydro-character-count.0.hp-percent",
        "weapon.waveriding-whirl.hydro-character-count.1.hp-percent",
        "weapon.waveriding-whirl.hydro-character-count.2.hp-percent"
      ],
      id: "weapon.waveriding-whirl.hydro-character-count.hp-percent",
      label: "乘浪的回旋 · 施放元素战技后的水元素角色数量对应生命值",
      source: weaponSource("WaveridingWhirl"),
      status: "implemented"
    },
    {
      id: "weapon.waveriding-whirl.swimming-stamina-consumption",
      label: "乘浪的回旋 · 游泳体力消耗降低",
      reason: "体力消耗只影响位移与循环，不改变当前核心动作的一次期望数值。",
      source: weaponSource("WaveridingWhirl"),
      status: "not_applicable"
    }
  ],
  equipmentId: "WaveridingWhirl",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
