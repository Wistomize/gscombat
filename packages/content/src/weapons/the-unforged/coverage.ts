import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.the-unforged.shield-strength"],
      id: "weapon.the-unforged.shield-strength",
      label: "无工之剑 · 护盾强效",
      source: weaponSource("TheUnforged"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.the-unforged.golden-majesty.unshielded.1-stack.attack-percent",
        "weapon.the-unforged.golden-majesty.unshielded.2-stack.attack-percent",
        "weapon.the-unforged.golden-majesty.unshielded.3-stack.attack-percent",
        "weapon.the-unforged.golden-majesty.unshielded.4-stack.attack-percent",
        "weapon.the-unforged.golden-majesty.unshielded.5-stack.attack-percent",
        "weapon.the-unforged.golden-majesty.shielded.1-stack.attack-percent",
        "weapon.the-unforged.golden-majesty.shielded.2-stack.attack-percent",
        "weapon.the-unforged.golden-majesty.shielded.3-stack.attack-percent",
        "weapon.the-unforged.golden-majesty.shielded.4-stack.attack-percent",
        "weapon.the-unforged.golden-majesty.shielded.5-stack.attack-percent"
      ],
      id: "weapon.the-unforged.golden-majesty.attack-percent",
      label: "无工之剑 · 金璋皇极的护盾状态与攻击命中层数",
      source: weaponSource("TheUnforged"),
      status: "implemented"
    }
  ],
  equipmentId: "TheUnforged",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
