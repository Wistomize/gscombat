import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.peak-patrol-song.ode-to-flowers.1-stack.defense-percent",
        "weapon.peak-patrol-song.ode-to-flowers.1-stack.all-element-damage-bonus",
        "weapon.peak-patrol-song.ode-to-flowers.2-stack.defense-percent",
        "weapon.peak-patrol-song.ode-to-flowers.2-stack.all-element-damage-bonus"
      ],
      id: "weapon.peak-patrol-song.ode-to-flowers.self-stats",
      label: "岩峰巡歌 · 花之颂层数对应的自身防御力与所有元素伤害",
      source: weaponSource("PeakPatrolSong"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.peak-patrol-song.2-stack.source-final-defense-to-party-all-element-damage-bonus"],
      id: "weapon.peak-patrol-song.two-stack.defense-scaled-party-all-element-damage-bonus",
      label: "岩峰巡歌 · 满层后按持有者防御力提供的队伍所有元素伤害",
      source: weaponSource("PeakPatrolSong"),
      status: "implemented"
    }
  ],
  equipmentId: "PeakPatrolSong",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
