import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.the-unforged.shield-strength"
      ],
      id: "weapon.the-unforged.shield-strength",
      label: "无工之剑 · 护盾强效",
      source: {
        kind: "weapon",
        weaponId: "TheUnforged"
      },
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.the-unforged.golden-majesty.unshielded.5-stack.attack-percent",
        "weapon.the-unforged.golden-majesty.shielded.5-stack.attack-percent"
      ],
      id: "weapon.the-unforged.golden-majesty.attack-percent",
      label: "无工之剑 · 金璋皇极的护盾状态与攻击命中层数",
      source: {
        kind: "weapon",
        weaponId: "TheUnforged"
      },
      status: "implemented"
    }
  ],
  equipmentId: "TheUnforged",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
