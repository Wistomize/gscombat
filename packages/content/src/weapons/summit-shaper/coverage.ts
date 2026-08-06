import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.summit-shaper.shield-strength"],
      id: "weapon.summit-shaper.shield-strength",
      label: "斫峰之刃 · 护盾强效",
      source: weaponSource("SummitShaper"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.summit-shaper.golden-majesty.unshielded.1-stack.attack-percent",
        "weapon.summit-shaper.golden-majesty.unshielded.2-stack.attack-percent",
        "weapon.summit-shaper.golden-majesty.unshielded.3-stack.attack-percent",
        "weapon.summit-shaper.golden-majesty.unshielded.4-stack.attack-percent",
        "weapon.summit-shaper.golden-majesty.unshielded.5-stack.attack-percent",
        "weapon.summit-shaper.golden-majesty.shielded.1-stack.attack-percent",
        "weapon.summit-shaper.golden-majesty.shielded.2-stack.attack-percent",
        "weapon.summit-shaper.golden-majesty.shielded.3-stack.attack-percent",
        "weapon.summit-shaper.golden-majesty.shielded.4-stack.attack-percent",
        "weapon.summit-shaper.golden-majesty.shielded.5-stack.attack-percent"
      ],
      id: "weapon.summit-shaper.golden-majesty.attack-percent",
      label: "斫峰之刃 · 金璋皇极的护盾状态与攻击命中层数",
      source: weaponSource("SummitShaper"),
      status: "implemented"
    }
  ],
  equipmentId: "SummitShaper",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
