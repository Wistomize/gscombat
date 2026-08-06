import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.freedom-sworn.damage-bonus",
        "weapon.freedom-sworn.full-sigil.party-attack-percent",
        "weapon.freedom-sworn.full-sigil.party-normal-charged-plunge-damage-bonus"
      ],
      id: "weapon.freedom-sworn.passive",
      label: "苍古自由之誓 · 抗争的践行之歌",
      source: weaponSource("FreedomSworn"),
      status: "implemented"
    }
  ],
  equipmentId: "FreedomSworn",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
