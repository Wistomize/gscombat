import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.dragonspine-spear.frost-icicle.without-cryo-aura.physical-hit",
        "weapon.dragonspine-spear.frost-icicle.with-cryo-aura.physical-hit"
      ],
      id: "weapon.dragonspine-spear.frost-icicle.physical-hit",
      label: "龙脊长枪 · 冷却就绪的霜葬物理伤害",
      source: weaponSource("DragonspineSpear"),
      status: "implemented"
    }
  ],
  equipmentId: "DragonspineSpear",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
