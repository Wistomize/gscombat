import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.lions-roar.pyro-or-electro-aura.damage-bonus",
        "weapon.lions-roar.pyro-or-electro-aura.damage-bonus.disabled"
      ],
      id: "weapon.lions-roar.pyro-or-electro-aura.damage-bonus",
      label: "匣里龙吟 · 当前目标受火元素或雷元素影响",
      source: {
        kind: "weapon",
        weaponId: "LionsRoar"
      },
      status: "implemented"
    }
  ],
  equipmentId: "LionsRoar",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
