import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed 7.0 coverage for Song of the Vigil. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.song-of-the-vigil.reaction-energy-restoration",
      label: "戍望谣歌 · 触发元素反应恢复元素能量",
      reason: "固定恢复元素能量不会改变当前单次动作伤害或元素充能效率。",
      source: weaponSource("SongOfTheVigil"),
      status: "not_applicable"
    },
    {
      effectIds: ["weapon.song-of-the-vigil.after-stellar-reaction.attack-percent"],
      id: "weapon.song-of-the-vigil.after-stellar-reaction.attack-percent",
      label: "戍望谣歌 · 触发星烁反应后的攻击力",
      source: weaponSource("SongOfTheVigil"),
      status: "implemented"
    }
  ],
  equipmentId: "SongOfTheVigil",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
