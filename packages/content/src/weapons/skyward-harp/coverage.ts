import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.skyward-harp.crit-damage", "weapon.skyward-harp.physical-hit"],
      id: "weapon.skyward-harp.passive",
      label: "天空之翼 · 回响长天的诗歌",
      source: weaponSource("SkywardHarp"),
      status: "implemented"
    }
  ],
  equipmentId: "SkywardHarp",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
