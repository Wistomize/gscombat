import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.memory-of-dust.shield-strength"
      ],
      id: "weapon.memory-of-dust.shield-strength",
      label: "尘世之锁 · 护盾强效",
      source: {
        kind: "weapon",
        weaponId: "MemoryOfDust"
      },
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.memory-of-dust.golden-majesty.unshielded.5-stack.attack-percent",
        "weapon.memory-of-dust.golden-majesty.shielded.5-stack.attack-percent"
      ],
      id: "weapon.memory-of-dust.golden-majesty.attack-percent",
      label: "尘世之锁 · 护盾状态与层数对应的攻击力",
      source: {
        kind: "weapon",
        weaponId: "MemoryOfDust"
      },
      status: "implemented"
    }
  ],
  equipmentId: "MemoryOfDust",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
