import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.sacrificial-sword.cooldown-reset",
      label: "祭礼剑 · 气定神闲",
      reason: "元素战技冷却重置不改变本次命中伤害，价值属于额外施放与循环。",
      source: weaponSource("SacrificialSword"),
      status: "not_applicable"
    }
  ],
  equipmentId: "SacrificialSword",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
