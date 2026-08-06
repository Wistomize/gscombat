import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.otherworldly-story.particle-or-orb-collection.self-healing",
      label: "异世界行记 · 拾取元素微粒或晶球后的自身治疗",
      reason: "拾取元素微粒或晶球后的自身治疗不进入当前角色核心动作伤害。",
      source: weaponSource("OtherworldlyStory"),
      status: "not_applicable"
    }
  ],
  equipmentId: "OtherworldlyStory",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
