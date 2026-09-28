import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.summit-shaper.shield-strength"
      ],
      id: "weapon.summit-shaper.shield-strength",
      label: "斫峰之刃 · 护盾强效",
      source: {
        kind: "weapon",
        weaponId: "SummitShaper"
      },
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.summit-shaper.golden-majesty.unshielded.5-stack.attack-percent",
        "weapon.summit-shaper.golden-majesty.shielded.5-stack.attack-percent"
      ],
      id: "weapon.summit-shaper.golden-majesty.attack-percent",
      label: "斫峰之刃 · 金璋皇极的护盾状态与攻击命中层数",
      source: {
        kind: "weapon",
        weaponId: "SummitShaper"
      },
      status: "implemented"
    }
  ],
  equipmentId: "SummitShaper",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
