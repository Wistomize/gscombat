import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.beacon-of-the-reed-sea.after-skill-hit.attack-percent",
        "weapon.beacon-of-the-reed-sea.after-taking-damage.attack-percent",
        "weapon.beacon-of-the-reed-sea.unshielded.hp-percent"
      ],
      id: "weapon.beacon-of-the-reed-sea.passive",
      label: "苇海信标 · 不屈的沙海",
      source: weaponSource("BeaconOfTheReedSea"),
      status: "implemented"
    }
  ],
  equipmentId: "BeaconOfTheReedSea",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
