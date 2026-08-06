import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.skyward-atlas.all-element-damage-bonus"],
      id: "weapon.skyward-atlas.all-element-damage-bonus",
      label: "天空之卷 · 所有元素伤害",
      source: weaponSource("SkywardAtlas"),
      status: "implemented"
    },
    {
      id: "weapon.skyward-atlas.favonius-cloud-autonomous-damage",
      label: "天空之卷 · 高天流云自主追敌攻击",
      reason: "高天流云属于武器自主伤害，不计入角色当前核心动作伤害。",
      source: weaponSource("SkywardAtlas"),
      status: "not_applicable"
    }
  ],
  equipmentId: "SkywardAtlas",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
