import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.skyward-harp.crit-damage"
      ],
      id: "weapon.skyward-harp.passive",
      label: "天空之翼 · 回响长天的诗歌",
      source: {
        kind: "weapon",
        weaponId: "SkywardHarp"
      },
      status: "implemented"
    }
  ],
  equipmentId: "SkywardHarp",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
