import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.vortex-vanquisher.shield-strength"],
      id: "weapon.vortex-vanquisher.shield-strength",
      label: "贯虹之槊 · 护盾强效",
      source: weaponSource("VortexVanquisher"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.vortex-vanquisher.golden-majesty.unshielded.1-stack.attack-percent",
        "weapon.vortex-vanquisher.golden-majesty.unshielded.2-stack.attack-percent",
        "weapon.vortex-vanquisher.golden-majesty.unshielded.3-stack.attack-percent",
        "weapon.vortex-vanquisher.golden-majesty.unshielded.4-stack.attack-percent",
        "weapon.vortex-vanquisher.golden-majesty.unshielded.5-stack.attack-percent",
        "weapon.vortex-vanquisher.golden-majesty.shielded.1-stack.attack-percent",
        "weapon.vortex-vanquisher.golden-majesty.shielded.2-stack.attack-percent",
        "weapon.vortex-vanquisher.golden-majesty.shielded.3-stack.attack-percent",
        "weapon.vortex-vanquisher.golden-majesty.shielded.4-stack.attack-percent",
        "weapon.vortex-vanquisher.golden-majesty.shielded.5-stack.attack-percent"
      ],
      id: "weapon.vortex-vanquisher.golden-majesty.attack-percent",
      label: "贯虹之槊 · 金璋皇极的护盾状态与攻击命中层数",
      source: weaponSource("VortexVanquisher"),
      status: "implemented"
    }
  ],
  equipmentId: "VortexVanquisher",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
