import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.bloodtainted-greatsword.pyro-or-electro-aura.damage-bonus"],
      id: "weapon.bloodtainted-greatsword.pyro-or-electro-aura.damage-bonus",
      label: "沐浴龙血的剑 · 当前目标受火元素或雷元素影响时的伤害",
      source: weaponSource("BloodtaintedGreatsword"),
      status: "implemented"
    }
  ],
  equipmentId: "BloodtaintedGreatsword",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
