import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.forged-by-the-golden-melody.counterpoint.attack-percent",
        "weapon.forged-by-the-golden-melody.counterpoint.amplifying.elemental-mastery",
        "weapon.forged-by-the-golden-melody.counterpoint.stellar-reaction-damage-bonus",
        "weapon.forged-by-the-golden-melody.current-song-and-counterpoint.attack-percent",
        "weapon.forged-by-the-golden-melody.current-song-and-counterpoint.amplifying.elemental-mastery",
        "weapon.forged-by-the-golden-melody.current-song-and-counterpoint.stellar-reaction-damage-bonus"
      ],
      id: "weapon.forged-by-the-golden-melody.current-song-and-counterpoint",
      label: "金律铸影 · 三种谐律乐章及星烁触发的同类复调",
      source: {
        kind: "weapon",
        weaponId: "ForgedByTheGoldenMelody"
      },
      status: "implemented"
    }
  ],
  equipmentId: "ForgedByTheGoldenMelody",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
