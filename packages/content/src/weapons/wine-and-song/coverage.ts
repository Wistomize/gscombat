import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.wine-and-song.after-sprint.attack-percent"],
      id: "weapon.wine-and-song.after-sprint.attack-percent",
      label: "暗巷的酒与诗 · 使用冲刺或替代冲刺后的攻击力",
      source: weaponSource("WineAndSong"),
      status: "implemented"
    },
    {
      id: "weapon.wine-and-song.sprint-stamina-consumption",
      label: "暗巷的酒与诗 · 冲刺或替代冲刺的体力消耗降低",
      reason: "体力消耗只影响移动与循环，不改变一个已选核心动作单次命中的伤害数值。",
      source: weaponSource("WineAndSong"),
      status: "not_applicable"
    }
  ],
  equipmentId: "WineAndSong",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
