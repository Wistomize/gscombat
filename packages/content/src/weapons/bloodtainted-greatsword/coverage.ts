import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.bloodtainted-greatsword.pyro-or-electro-aura.damage-bonus",
        "weapon.bloodtainted-greatsword.pyro-or-electro-aura.damage-bonus.disabled"
      ],
      id: "weapon.bloodtainted-greatsword.pyro-or-electro-aura.damage-bonus",
      label: "沐浴龙血的剑 · 当前目标受火元素或雷元素影响时的伤害",
      source: {
        kind: "weapon",
        weaponId: "BloodtaintedGreatsword"
      },
      status: "implemented"
    }
  ],
  equipmentId: "BloodtaintedGreatsword",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
