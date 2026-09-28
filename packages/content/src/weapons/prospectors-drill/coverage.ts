import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.prospectors-drill.unity.3-mark.attack-percent",
        "weapon.prospectors-drill.unity.3-mark.all-element-damage-bonus"
      ],
      id: "weapon.prospectors-drill.unity.stats",
      label: "勘探钻机 · 消耗团结标记后的攻击力与所有元素伤害",
      source: {
        kind: "weapon",
        weaponId: "ProspectorsDrill"
      },
      status: "implemented"
    }
  ],
  equipmentId: "ProspectorsDrill",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
