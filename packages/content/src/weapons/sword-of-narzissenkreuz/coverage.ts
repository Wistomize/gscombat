import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.sword-of-narzissenkreuz.no-arkhe.arkhe-aligned-energy-impact",
      label: "水仙十字之剑 · 无始基力角色的冷却就绪芒性或荒性能量冲击",
      reason: "始基力能量冲击是武器独立事件，不计入角色当前核心动作伤害。",
      source: weaponSource("SwordOfNarzissenkreuz"),
      status: "not_applicable"
    },
    {
      id: "weapon.sword-of-narzissenkreuz.arkhe-holder-passive-ineligibility",
      label: "水仙十字之剑 · 始基力角色不会触发能量冲击",
      reason: "武器被动仅在装备者不具备始基力时触发，因此该分支不参与所选核心动作伤害结算。",
      source: weaponSource("SwordOfNarzissenkreuz"),
      status: "not_applicable"
    }
  ],
  equipmentId: "SwordOfNarzissenkreuz",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
