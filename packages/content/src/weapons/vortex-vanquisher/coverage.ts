import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.vortex-vanquisher.shield-strength"
      ],
      id: "weapon.vortex-vanquisher.shield-strength",
      label: "贯虹之槊 · 护盾强效",
      source: {
        kind: "weapon",
        weaponId: "VortexVanquisher"
      },
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.vortex-vanquisher.golden-majesty.unshielded.5-stack.attack-percent",
        "weapon.vortex-vanquisher.golden-majesty.shielded.5-stack.attack-percent"
      ],
      id: "weapon.vortex-vanquisher.golden-majesty.attack-percent",
      label: "贯虹之槊 · 金璋皇极的护盾状态与攻击命中层数",
      source: {
        kind: "weapon",
        weaponId: "VortexVanquisher"
      },
      status: "implemented"
    }
  ],
  equipmentId: "VortexVanquisher",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
