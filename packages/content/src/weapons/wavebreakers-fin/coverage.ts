import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.wavebreakers-fin.burst-damage-bonus"],
      id: "weapon.wavebreakers-fin.burst",
      label: "断浪长鳍 · 驭浪的海祇民",
      source: weaponSource("WavebreakersFin"),
      status: "implemented"
    }
  ],
  equipmentId: "WavebreakersFin",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
