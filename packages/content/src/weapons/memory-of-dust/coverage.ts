import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.memory-of-dust.shield-strength"],
      id: "weapon.memory-of-dust.shield-strength",
      label: "尘世之锁 · 护盾强效",
      source: weaponSource("MemoryOfDust"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.memory-of-dust.golden-majesty.unshielded.1-stack.attack-percent",
        "weapon.memory-of-dust.golden-majesty.unshielded.2-stack.attack-percent",
        "weapon.memory-of-dust.golden-majesty.unshielded.3-stack.attack-percent",
        "weapon.memory-of-dust.golden-majesty.unshielded.4-stack.attack-percent",
        "weapon.memory-of-dust.golden-majesty.unshielded.5-stack.attack-percent",
        "weapon.memory-of-dust.golden-majesty.shielded.1-stack.attack-percent",
        "weapon.memory-of-dust.golden-majesty.shielded.2-stack.attack-percent",
        "weapon.memory-of-dust.golden-majesty.shielded.3-stack.attack-percent",
        "weapon.memory-of-dust.golden-majesty.shielded.4-stack.attack-percent",
        "weapon.memory-of-dust.golden-majesty.shielded.5-stack.attack-percent"
      ],
      id: "weapon.memory-of-dust.golden-majesty.attack-percent",
      label: "尘世之锁 · 护盾状态与层数对应的攻击力",
      source: weaponSource("MemoryOfDust"),
      status: "implemented"
    }
  ],
  equipmentId: "MemoryOfDust",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
