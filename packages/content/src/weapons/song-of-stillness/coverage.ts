import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.song-of-stillness.after-heal.damage-bonus"],
      id: "weapon.song-of-stillness.after-heal.damage-bonus",
      label: "静谧之曲 · 受到治疗后",
      source: weaponSource("SongOfStillness"),
      status: "implemented"
    }
  ],
  equipmentId: "SongOfStillness",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
