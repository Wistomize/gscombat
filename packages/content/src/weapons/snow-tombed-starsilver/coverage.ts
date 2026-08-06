import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.snow-tombed-starsilver.frost-icicle.without-cryo-aura.physical-hit",
        "weapon.snow-tombed-starsilver.frost-icicle.with-cryo-aura.physical-hit"
      ],
      id: "weapon.snow-tombed-starsilver.frost-icicle.physical-hit",
      label: "雪葬的星银 · 冷却就绪的霜葬物理伤害",
      source: weaponSource("SnowTombedStarsilver"),
      status: "implemented"
    }
  ],
  equipmentId: "SnowTombedStarsilver",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
