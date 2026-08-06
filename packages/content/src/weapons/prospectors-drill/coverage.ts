import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.prospectors-drill.unity.1-mark.attack-percent",
        "weapon.prospectors-drill.unity.1-mark.all-element-damage-bonus",
        "weapon.prospectors-drill.unity.2-mark.attack-percent",
        "weapon.prospectors-drill.unity.2-mark.all-element-damage-bonus",
        "weapon.prospectors-drill.unity.3-mark.attack-percent",
        "weapon.prospectors-drill.unity.3-mark.all-element-damage-bonus"
      ],
      id: "weapon.prospectors-drill.unity.stats",
      label: "勘探钻机 · 消耗团结标记后的攻击力与所有元素伤害",
      source: weaponSource("ProspectorsDrill"),
      status: "implemented"
    }
  ],
  equipmentId: "ProspectorsDrill",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
