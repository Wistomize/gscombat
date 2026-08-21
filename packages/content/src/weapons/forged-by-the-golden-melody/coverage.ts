import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed 7.0 coverage for Forged by the Golden Melody. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.forged-by-the-golden-melody.current-song-and-counterpoint.attack-percent",
        "weapon.forged-by-the-golden-melody.current-song-and-counterpoint.amplifying.elemental-mastery",
        "weapon.forged-by-the-golden-melody.current-song-and-counterpoint.ordinary.elemental-mastery",
        "weapon.forged-by-the-golden-melody.current-song-and-counterpoint.stellar-reaction-damage-bonus"
      ],
      id: "weapon.forged-by-the-golden-melody.current-song-and-counterpoint",
      label: "金律铸影 · 三种谐律乐章及星烁触发的同类复调",
      source: weaponSource("ForgedByTheGoldenMelody"),
      status: "implemented"
    }
  ],
  equipmentId: "ForgedByTheGoldenMelody",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
